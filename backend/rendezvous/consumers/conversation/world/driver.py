import json
from asgiref.sync import async_to_sync

from rendezvous.models import Conversation
from rendezvous.utils.get_userIDs_from_coversation import get_userIDs_from_coversation
from rendezvous.serializers.conversation import ConversationSerializer
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
      - For example: send_participants_list()
    - blast methods
      - These methods send a message to everyone in the room
      - For example: blast_user_joined()
    """

    def send_my_conversations(self):
        """
        Sends the list of all messages that have been
        sent by users in the conversation till now
        """
        conversations = Conversation.objects.filter(
            participants__in=[self.user]
        ).order_by('-datetime_modified')

        message = {
            'type': websocket_message_types.CONVERSATIONS_LIST,
            'message': ConversationSerializer(conversations, many=True).data
        }

        self.send(
            text_data=json.dumps(message)
        )

    def send_new_message_driver(self, new_message):
        """
        Informs the participants of a conversation that they have a new message
        """

        try:
            conversation = Conversation.objects.get(id=new_message['conversationID'])
        except Conversation.DoesNotExist:
            return

        if self.user not in conversation.participants.all():
            return

        participants = get_userIDs_from_coversation(conversation)

        message = {
            'type': websocket_message_types.NEW_MESSAGE,
            'message': {
                'message': new_message['message'],
                'conversationID': new_message['conversationID']
            },
            'participants': participants,
        }

        async_to_sync(self.channel_layer.group_send)(
            self.world_name,
            {
                'type': "send_info_to_conversation",
                'message': message
            }
        )
