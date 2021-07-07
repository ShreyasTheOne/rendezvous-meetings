import json

from datetime import datetime
from django.db.models import Q
from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from rendezvous.models import *
from rendezvous.constants import participant_status, websocket_close_codes, websocket_message_types

from rendezvous.consumers.room.helper import HelperMixin
from rendezvous.consumers.room.driver import DriverMixin


class RoomConsumer(WebsocketConsumer, HelperMixin, DriverMixin):
    """
    This consumer handles all the websocket connections and requests for users to
    enter and exit the meeting.

    This class contains only those methods that are essential to accepting requests and messages,
    and sending responses. Other methods that support the consumer are stored in HelperMixin and DriverMixin.
    """

    def connect(self):
        """
        This method is the first method of the consumer that is called when
        a client requests to form a new websocket connection
        """

        # Extract information from scope

        self.user = self.scope['user']
        self.meeting_code = self.scope['url_route']['kwargs'].get('meeting_code', None)

        # The room includes people waiting in the lobby as well
        self.room_name = f'room-{self.meeting_code}'

        meeting_code = self.meeting_code
        try:
            # Validate meeting code
            self.meeting = Meeting.objects.get(code=meeting_code)
        except Meeting.DoesNotExist:
            # Meeting with given code does not exist
            self.close(
                code=websocket_close_codes.MEETING_CODE_INVALID.get('code'),
            )
            return

        # Validate participant
        try:
            # Check if the user has a participant object created for this meeting,
            # that is not waiting in the lobby
            participant = Participant.objects.get(
                Q(meeting=self.meeting) &
                Q(user=self.user) &
                ~Q(status=participant_status.WAITING_IN_LOBBY)
            )

            # If the subsequent code is executed, it means that a participant object has been found

            # Check to see if user is banned from the meeting
            if participant.status == participant_status.BANNED:
                self.close(
                    code=websocket_close_codes.MEETING_CODE_INVALID.get('code'),
                )
                return

            # Allow entry through multiple sessions
            if participant.status == participant_status.ATTENDING:
                self.accept()
                self.handle_join()
                return

            # User had been allowed before, and not banned.
            if participant.status == participant_status.LEFT:
                self.accept()
                self.handle_join()

                if self.user == self.meeting.host:
                    # Inform everyone that host joined
                    # So that those waiting in queue can get their requests accepted
                    self.blast_pending_host_permission_message()
                return

        except Participant.DoesNotExist:
            # User is joining this meeting for the first time
            self.accept()

            if self.user in self.meeting.invitees.all():
                self.handle_join()
            elif self.user == self.meeting.host:
                # Inform everyone that host joined
                # So that those waiting in queue can get their requests accepted
                self.handle_join()
                self.blast_pending_host_permission_message()
            else:
                # Request host to let him in

                # Host is attending if the length of the filtered objects is positive (1)
                host_is_attending = len(
                    Participant.objects.filter(
                        meeting=self.meeting,
                        user=self.meeting.host,
                        status=participant_status.ATTENDING
                    )
                ) > 0
                async_to_sync(self.channel_layer.group_add)(
                    self.room_name,
                    self.channel_name
                )
                if host_is_attending:
                    self.send_pending_host_permission_message()
                    self.ask_host_for_permission()
                else:
                    self.send_pending_host_join_message()
                    self.add_to_waiting_list()
                pass
        return

    def disconnect(self, close_code):
        try:
            participant = Participant.objects.get(
                meeting=self.meeting,
                user=self.user,
                status=participant_status.ATTENDING
            )
            participant.status = participant_status.LEFT
            participant.save()

            participant_count = Participant.objects.filter(
                meeting=self.meeting,
                status=participant_status.ATTENDING
            ).count()
            if participant_count == 0:
                # Everyone has left the meeting
                self.meeting.end_time = datetime.now()

        except Exception:
            pass

        async_to_sync(self.channel_layer.group_discard)(
            self.room_name,
            self.channel_name
        )

        self.close(close_code)

    def receive(self, text_data=None, bytes_data=None):
        payload = json.loads(text_data)
        type = payload.get('type', None)
        message = payload.get('message', None)

        if not type or not message:
            return

        print("type", type)

        if type == websocket_message_types.ADMIT_USER:
            if self.user != self.meeting.host:
                return
            self.admit_user(message)
        elif type == websocket_message_types.REJECT_USER:
            if self.user != self.meeting.host:
                return
            self.ban_user(message)
        elif type == websocket_message_types.BAN_USER:
            if self.user != self.meeting.host:
                return
            self.ban_user(message) # Performs same functionality as user ban
        elif type == websocket_message_types.REMOVE_USER:
            if self.user != self.meeting.host:
                return
            self.remove_user(message) # Performs same functionality as user ban
        return

    def close(self, code=None):
        try:
            self.accept()
        except Exception:
            pass
        WebsocketConsumer.close(self, code=code)


    """
    Channels event handlers
    These methods send messages to client sockets 
    """

    def send_info_to_all(self, event):
        """
        Sends a broadcast message to all users in the group
        """
        self.send(
            text_data=json.dumps(event['message'])
        )

    def send_info_to_host(self, event):
        """
        Sends a message to the host of the meeting
        """
        if self.user == self.meeting.host:
            self.send(
                text_data=json.dumps(event['message'])
            )

    def send_info_to_all_but_host(self, event):
        """
        Sends a broadcast message to all users in the group except the host
        """
        if self.user != self.meeting.host:
            self.send(
                text_data=json.dumps(event['message'])
            )

    def send_info_to_user(self, event):
        """
        Sends a message to a specific user, whose ID is specified in the message
        """
        if str(self.user.uuid) == str(event['message']['uuid']):
            self.send(
                text_data=json.dumps(event['message'])
            )

    def send_info_to_all_but_user(self, event):
        """
        Sends a message to a everyone but a specific user, whose ID is specified in the message
        """
        if self.user.get_uuid_str() != event['message']['uuid']:
            print("sending to", event['message']['uuid'] )
            self.send(
                text_data=json.dumps(event['message'])
            )
        else:
            print("saved from", event['message']['uuid'] )

    def send_rejected_message(self, event):
        """
        Rejects the specified user by closing the websocket connection
        with the appropriate code
        """
        if str(self.user.uuid) == str(event['message']['uuid']):
            self.close(
                code=websocket_close_codes.MEETING_CODE_INVALID.get('code'),
            )

    def send_banned_message(self, event):
        """
        Rejects the specified user by closing the websocket connection
        with the appropriate code
        """
        if str(self.user.uuid) == str(event['message']['uuid']):
            self.close(
                code=websocket_close_codes.YOU_ARE_BANNED.get('code'),
            )
        # else:
        #     self.send(
        #         text_data=json.dumps(event['message']['message'])
        #     )

    def send_removed_message(self, event):
        """
        Remove the specified user by closing the websocket connection
        with the appropriate code
        """
        if str(self.user.uuid) == str(event['message']['uuid']):
            self.close(
                code=websocket_close_codes.YOU_ARE_REMOVED.get('code'),
            )
        # else:
        #     self.send(
        #         text_data=json.dumps(event['message']['message'])
        #     )
