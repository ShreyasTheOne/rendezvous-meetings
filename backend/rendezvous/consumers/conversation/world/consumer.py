import json
from urllib.parse import quote, unquote

from asgiref.sync import async_to_sync
from channels.generic.websocket import WebsocketConsumer

from rendezvous.constants import websocket_message_types

from rendezvous.consumers.conversation.world.helper import HelperMixin
from rendezvous.consumers.conversation.world.driver import DriverMixin


class WorldConversationConsumer(WebsocketConsumer, HelperMixin, DriverMixin):
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

        # The world includes everyone in the meeting currently using conversations
        self.world_name = 'global-conversations'

        self.accept()

        # If the subsequent code is executed, it means that a participant object has been found
        async_to_sync(self.channel_layer.group_add)(
            self.world_name,
            self.channel_name
        )

        self.send_my_conversations()

        return

    def disconnect(self, close_code):
        """
        Last method from this consumer when the user disconnects from the meeting
        """
        async_to_sync(self.channel_layer.group_discard)(
            self.world_name,
            self.channel_name
        )
        self.close()

    def receive(self, text_data=None, bytes_data=None):
        text_data = unquote(text_data)
        payload = json.loads(text_data)

        type = payload.get('type', None)
        message = payload.get('message', None)

        if type == websocket_message_types.SEND_MESSAGE:
            self.send_new_message_driver(message)
        if type == websocket_message_types.CONVERSATION_CREATE:
            self.create_conversation_helper(message)

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

    def send_info_to_conversation(self, event):
        """
        Send a message to all active participants in the specified conversation
        """
        if self.user.get_uuid_str() in event['message']['participants']:
            self.send(
                text_data=quote(json.dumps(event['message']))
            )
