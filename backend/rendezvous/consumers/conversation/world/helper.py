from asgiref.sync import async_to_sync

from rendezvous.models import Conversation
from rendezvous.serializers.conversation import ConversationSerializer
from rendezvous.constants import websocket_message_types
from rendezvous.utils.get_userIDs_from_coversation import get_userIDs_from_coversation

from rendezvous_authentication.models import User



class HelperMixin():
    """
    This mixin houses the helper methods used by the WorldConversationConsumer
    Helper methods are the methods that:
      - Act on the messages received by the WorldConversationConsumer
      - Execute logic that is not necessary to be in the consumer itself
      - Call the driver methods of WorldConversationConsumer to send the message
    """

    def create_conversation_helper(self, inputs):
        """
        Handles creation of a new conversation.
        """

        # List of email-ids of the users invited to the conversation
        other_participants = inputs.get('participants_selected', None)

        if not other_participants:
            return

        # Title of the conversation
        title = inputs.get('title', None)

        # Title of a group chat cannot be empty
        if not title and len(other_participants) > 1:
            return

        # Create conversation object
        conversation = Conversation(title=title)
        # Save conversation object to the database
        conversation.save()

        # List of participant emails to later send emails to
        participant_emails = []

        conversation.participants.add(self.user)

        # Add participants
        for p in other_participants:
            # participants is a list of emails
            email = p

            # Validate invitee
            if not email:
                continue

            if email is self.user.email:
                participant_emails.append(email)
                continue

            try:
                user = User.objects.get(email=email)
                conversation.participants.add(user)

                participant_emails.append(user.email)
            except User.DoesNotExist:
                pass

        conversation.save()
        participants = get_userIDs_from_coversation(conversation)

        message = {
            'message': {
                'conversation': ConversationSerializer(conversation).data,
            },
            'participants': participants,
            'type': websocket_message_types.CONVERSATION_CREATE
        }

        # Driver function for a driver :)
        async_to_sync(self.channel_layer.group_send)(
            self.world_name,
            {
                'type': "send_info_to_conversation",
                'message': message
            }
        )
