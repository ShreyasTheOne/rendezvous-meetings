from rendezvous.models import Conversation, PersonalMessage
from rendezvous.serializers.message import PersonalMessageSerializer


def get_last_message_from_conversation(conversation):
    """
    Returns the serialized last message that was sent in the conversation
    """

    all_messages = PersonalMessage.objects.filter(receiver=conversation)
    last_message = all_messages.order_by('-send_time').first()

    if last_message:
        return PersonalMessageSerializer(last_message).data
    else:
        return {}
