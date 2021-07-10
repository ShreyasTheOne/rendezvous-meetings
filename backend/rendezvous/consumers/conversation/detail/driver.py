import json
from asgiref.sync import async_to_sync

from rendezvous.models import PersonalMessage
from rendezvous.serializers.message import PersonalMessageSerializer
from rendezvous.serializers.conversation import ConversationSerializer
from rendezvous.serializers.meeting import MeetingShallowSerializer
from rendezvous.constants import websocket_message_types


class DriverMixin():
    """
    This mixin houses the driver methods used by the ConversationConsumer
    Driver methods are the methods that:
      - Create the message object to be sent
      - Call the 'send()' method of WebsocketConsumer to send the message

    These driver methods are called by the helper methods.
    The code for message creation and sending is kept separate to prevent clutter

    There are two types of methods:
    - send methods
      - These methods send a message to self
      - For example: send_conversation_info_driver()
    - blast methods
      - These methods send a message to everyone in the room
      - For example: blast_new_message_driver()
    """

    def send_conversation_info_driver(self):
        """
        Sends the list of all messages that have been
        sent by users in the conversation till now
        """

        messages = PersonalMessage.objects.filter(receiver=self.conversation).order_by('send_time')

        message = {
            'type': websocket_message_types.CONVERSATION_INFO,
            'message': {
                'messages': PersonalMessageSerializer(messages, many=True).data,
                'conversation': ConversationSerializer(self.conversation).data
            }
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
            'message': PersonalMessageSerializer(new_message).data
        }

        async_to_sync(self.channel_layer.group_send)(
            self.conversation_name,
            {
                'type': "send_info_to_all",
                'message': message
            }
        )

    def blast_ongoing_meeting_driver(self, meeting):
        """
        Inform users of this conversation that a meeting has started
        """

        message = {
            'type': websocket_message_types.CONVERSATION_MEETING_LIVE,
            'message': MeetingShallowSerializer(meeting).data
        }

        async_to_sync(self.channel_layer.group_send)(
            self.conversation_name,
            {
                'type': "send_info_to_all",
                'message': message
            }
        )
