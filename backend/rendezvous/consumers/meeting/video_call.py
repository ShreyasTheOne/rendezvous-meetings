import json
from datetime import datetime
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from rendezvous.models import *
from rendezvous.constants import participant_status, websocket_error_codes, websocket_message_types

from rendezvous.utils.get_users_from_participants import get_users_from_participants


class VideoCallConsumer(WebsocketConsumer):

    def __init__(self, *args, **kwargs):
        super().__init__()

    #
    # Websocket methods
    #

    def connect(self):
        # Extract meeting code from scope
        self.meeting_code = self.scope['url_route']['kwargs'].get('meeting_code', None)
        self.user = self.scope['user']
        self.channel_group_name = f'video-call-{self.meeting_code}'

        meeting_code = self.meeting_code
        try:
            # Validate meeting code
            self.meeting = Meeting.objects.get(code=meeting_code)
        except Meeting.DoesNotExist:
            # Meeting with given code does not exist
            print("Invalid meeting")
            self.close(
                code=websocket_error_codes.MEETING_CODE_INVALID.get('code'),
            )
            return

        # Validate participant
        try:
            # Check if the user has a participant object created for this meeting
            participant = Participant.objects.get(
                meeting=self.meeting,
                user=self.user
            )

            # If the subsequent code is executed, it means that a participant object
            # has been found

            # Check to see if user is banned from the meeting
            if participant.status == participant_status.BANNED:
                print("User banned")
                self.close(
                    code=websocket_error_codes.USER_BANNED.get('code'),
                )
                return

            # Allow entry through only one session
            if participant.status == participant_status.ATTENDING:
                print("User already attending")
                self.accept()
                self.handle_join()
                return

            # User had been allowed before, and not banned.
            if participant.status == participant_status.LEFT:
                print("User joined")
                self.accept()

                if self.user == self.meeting.host:
                    # Inform everyone that host joined
                    # So that those waiting in queue can get their requests accepted
                    self.blast_host_joined()

                self.handle_join()
                return

        except Participant.DoesNotExist:
            # User is joining this meeting for the first time
            self.accept()

            if self.user in self.meeting.invitees.all():
                print("invitee joined")
                self.handle_join()
            elif self.user == self.meeting.host:
                # Inform everyone that host joined
                # So that those waiting in queue can get their requests accepted
                self.blast_host_joined()
                self.handle_join()
            else:
                # Request host to let him in
                print("none matched")
                pass

        return

    def disconnect(self, close_code):
        try:
            participant = Participant.objects.get(
                meeting=self.meeting,
                user=self.user,
                status=participant_status.ATTENDING
            )
            participant.status=participant_status.LEFT
            participant.save()
        except Participant.DoesNotExist:
            pass

        self.close()

    def receive(self, text_data=None, bytes_data=None):
        payload = json.loads(text_data)
        type = payload.get('type', None)
        message = payload.get('message', None)

        if not type or not message:
            return

        print("type", type)

        if type in websocket_message_types.generic_message_types:
            print("type", type ,"in", websocket_message_types.generic_message_types)
            self.blast_generic_message(payload)
            return

        return

    #
    # Helper methods
    #

    def handle_join(self):
        # Add self to channel layer group of meeting
        async_to_sync(self.channel_layer.group_add)(
            self.channel_group_name,
            self.channel_name
        )

        try:
            participant = Participant.objects.get(
                meeting=self.meeting,
                user=self.user,
            )
            participant.status = participant_status.ATTENDING
            participant.save()
        except Participant.DoesNotExist:
            _ = Participant.objects.create(
                meeting=self.meeting,
                user=self.user,
                status=participant_status.ATTENDING
            )

        # Send meeting information to self
        self.send_meeting_info()

        # Tell everyone else that a new user joined
        self.blast_user_joined()

        # Send participants information to self
        self.send_participants_info()

        return

    #
    # Driver methods
    # Send - send to self
    # Blast - Send to everyone
    #

    def send_meeting_info(self):
        meeting_information = {
            'code': self.meeting.code,
            'title': self.meeting.title,
            'description': self.meeting.description,
        }
        message = {
            'type': websocket_message_types.MEETING_INFORMATION,
            'message': meeting_information
        }
        self.send(text_data=json.dumps(message))

    def send_participants_info(self):
        # Get all active participants in our meeting
        participants = Participant.objects.filter(
            meeting=self.meeting,
            status=participant_status.ATTENDING
        )
        users_data = get_users_from_participants(participants)
        message = {
            'type': websocket_message_types.PARTICIPANT_LIST,
            'message': users_data
        }
        self.send(
            text_data=json.dumps(message)
        )

    def blast_host_joined(self):
        message = {
            'type': websocket_message_types.HOST_JOINED,
            'message': 'The host has joined the meeting'
        }
        async_to_sync(self.channel_layer.group_send)(
            self.channel_group_name,
            {
                'type': "send_info",
                'message': message,
            }
        )

    def blast_user_joined(self):
        message = {
            'type': websocket_message_types.USER_JOINED,
            'message': 'A user has joined the meeting'
        }
        async_to_sync(self.channel_layer.group_send)(
            self.channel_group_name,
            {
                'type': "send_info",
                'message': message,
            }
        )

    def blast_generic_message(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.channel_group_name,
            {
                'type': "send_info",
                'message': message,
            }
        )

    #
    # Channels event handlers
    #

    def send_info(self, event):
        self.send(
            text_data=json.dumps(event['message'])
        )
