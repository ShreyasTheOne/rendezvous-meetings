from django.db import models

from .base import Message
from rendezvous.models.conversation import Conversation


class PersonalMessage(Message):
    """
    This models stores information about a message sent personally.
    """

    # The conversation to which the messages are being sent
    receiver = models.ForeignKey(
        Conversation,
        related_name='message',
        on_delete=models.CASCADE,
        null=False
    )
