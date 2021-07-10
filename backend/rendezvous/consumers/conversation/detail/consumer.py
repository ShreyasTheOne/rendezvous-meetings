import json
from urllib.parse import quote, unquote

from django.db.models import Q

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from rendezvous.models import Conversation
from rendezvous.constants import participant_status, websocket_close_codes, websocket_message_types

from rendezvous.consumers.conversation.detail.helper import HelperMixin
from rendezvous.consumers.conversation.detail.driver import DriverMixin


class ConversationConsumer(WebsocketConsumer, HelperMixin, DriverMixin):
    """
    This consumer handles all the websocket connections and requests that are needed to
    send and receive conversation messages in real time.
    """

    def connect(self):
        """
        This method is the first method of the consumer that is called
        when a client requests to form a new websocket connection
        """

        # Extract information from scope

        self.user = self.scope['user']
        self.conversation_id = self.scope['url_route']['kwargs'].get('conversation_id', None)

        # The conversation group includes only those people who are participants of the conversation
        self.conversation_name = f'conversation-{self.conversation_id}'

        conversation_id = self.conversation_id
        try:
            # Validate conversation id
            self.conversation = Conversation.objects.get(id=conversation_id)
        except Conversation.DoesNotExist:
            # Conversation with given code does not exist
            self.close(
                code=websocket_close_codes.CONVERSATION_ID_INVALID.get('code'),
            )
            return

        # Validate participant
        if self.user in self.conversation.participants.all():
            self.accept()
        else:
            self.close(
                code=websocket_close_codes.CONVERSATION_ID_INVALID.get('code')
            )

        # If the subsequent code is executed, it means that a participant object has been found
        async_to_sync(self.channel_layer.group_add)(
            self.conversation_name,
            self.channel_name
        )

        # Send messages from this conversation to self
        self.send_conversation_info_driver()

        # Inform if any meeting is ongoing
        self.inform_ongoing_meeting_helper()

        return

    def disconnect(self, close_code):
        """
        Last method from this consumer when the user disconnects from the meeting
        """
        async_to_sync(self.channel_layer.group_discard)(
            self.conversation_name,
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
        if type == websocket_message_types.CONVERSATION_MEETING_LIVE:
            self.inform_ongoing_meeting_helper()

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
