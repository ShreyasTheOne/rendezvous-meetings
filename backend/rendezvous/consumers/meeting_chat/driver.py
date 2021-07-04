import json
from asgiref.sync import async_to_sync

from rendezvous.models import MeetingMessage
from rendezvous.serializers.message import MeetingMessageSerializer
from rendezvous.constants import websocket_message_types


class DriverMixin():
    """
    This mixin houses the driver methods used by the VideoCallConsumer
    Driver methods are the methods that:
      - Create the message object to be sent
      - Call the 'send()' method of WebsocketConsumer to send the message

    These driver methods are called by the helper methods.
    The code for message creation and sending is kept separate to prevent clutter

    There are two types of methods:
    - send methods
      - These methods send a message to self
      - For example: send_participants_list()
    - blast methods
      - These methods send a message to everyone in the room
      - For example: blast_user_joined()
    """

    def send_hitherto_messages_driver(self):
        """
        Sends the list of all messages that have been sent by users in the meeting
        till now
        """

        messages = MeetingMessage.objects.filter(receiver=self.meeting).order_by('send_time')
        serializer = MeetingMessageSerializer(messages, many=True)

        message = {
            'type': websocket_message_types.MESSAGES_LIST,
            'message': serializer.data
        }

        self.send(
            text_data=json.dumps(message)
        )

    def blast_new_message_driver(self, new_message):
        """
        Delivers the new message to everyone in the meeting
        """

        message = {
            'type': websocket_message_types.NEW_MESSAGE,
            'message': MeetingMessageSerializer(new_message).data
        }

        async_to_sync(self.channel_layer.group_send)(
            self.chat_group_name,
            {
                'type': "send_info_to_all",
                'message': message
            }
        )
