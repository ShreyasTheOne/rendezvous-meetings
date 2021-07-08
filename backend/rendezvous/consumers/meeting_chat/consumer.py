import json
from urllib.parse import quote, unquote

from django.db.models import Q

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from rendezvous.models import *
from rendezvous.constants import participant_status, websocket_close_codes, websocket_message_types

from rendezvous.consumers.meeting_chat.helper import HelperMixin
from rendezvous.consumers.meeting_chat.driver import DriverMixin


class MeetingChatConsumer(WebsocketConsumer, HelperMixin, DriverMixin):
    """
    This consumer handles all the websocket connections and requests that are needed to
    send and receive meeting chat messages in real time

    If a user forms a connection here, it means that it has already passed authentication
    in RoomConsumer. Hence, there must exist a participant object for this user in this
    meeting whose status is ATTENDING

    This class contains only those methods that are essential to accepting requests and
    messages, and sending responses. Other methods that support the consumer are stored
    in HelperMixin and DriverMixin.
    """

    def connect(self):
        """
        This method is the first method of the consumer that is called
        when a client requests to form a new websocket connection
        """

        # Extract information from scope

        self.user = self.scope['user']
        self.meeting_code = self.scope['url_route']['kwargs'].get('meeting_code', None)

        # The meeting_chat group includes only those people who are allowed into the meeting
        self.chat_group_name = f'chat_group-{self.meeting_code}'

        meeting_code = self.meeting_code
        try:
            # Validate meeting code
            self.meeting = Meeting.objects.get(code=meeting_code)
        except Meeting.DoesNotExist:
            # Meeting with given code does not exist
            print("1")
            self.close(
                code=websocket_close_codes.MEETING_CODE_INVALID.get('code'),
            )
            return

        # Validate participant
        try:
            # Check if the user has a participant object created for this meeting,
            # that is not waiting in the lobby
            _ = Participant.objects.get(
                Q(meeting=self.meeting)
                & Q(user=self.user)
                & (
                    Q(status=participant_status.ATTENDING)
                    | Q(status=participant_status.LEFT)
                )
            )
            self.accept()

        except Participant.DoesNotExist:
            # User is not in this meeting, but he may be an invitee or host
            if self.user == self.meeting.host:
                self.accept()
            elif self.user in self.meeting.invitees.all():
                self.accept()
            else:
                self.close(
                    code=websocket_close_codes.MEETING_CODE_INVALID.get('code')
                )

        # If the subsequent code is executed, it means that a participant object has been found
        async_to_sync(self.channel_layer.group_add)(
            self.chat_group_name,
            self.channel_name
        )

        # Send participants information to self
        self.send_hitherto_messages_driver()

        return

    def disconnect(self, close_code):
        """
        Last method from this consumer when the user disconnects from the meeting
        """
        async_to_sync(self.channel_layer.group_discard)(
            self.chat_group_name,
            self.channel_name
        )
        self.close()

    def receive(self, text_data=None, bytes_data=None):
        text_data = unquote(text_data)
        payload = json.loads(text_data)
        type = payload.get('type', None)
        message = payload.get('message', None)

        if type == websocket_message_types.SEND_MESSAGE:
            self.send_message_helper(message)

        return

    def close(self, code=None):
        """
        Ensure the connection is accepted before it is closed
        to prevent any issues that arise
        """
        try:
            self.accept()
        except Exception:
            pass
        WebsocketConsumer.close(self, code=code)

    """
    Channels event handlers
    These methods are used when messages are blasted
    """

    def send_info_to_all(self, event):
        """
        Sends a broadcast message to all users in the group
        """
        self.send(
            text_data=quote(json.dumps(event['message']))
        )

    def send_info_to_user(self, event):
        """
        Sends a message to a specific user, whose ID is specified in the message
        """
        if str(self.user.uuid) == str(event['message']['uuid']):
            self.send(
                text_data=quote(json.dumps(event['message']))
            )
