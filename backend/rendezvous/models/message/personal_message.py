from django.db import models
from django.conf import settings
from .base import Message


class PersonalMessage(Message):
    """
    This models stores information about a message sent personally.
    """

    receiver = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='message_received',
        on_delete=models.CASCADE,  # Delete message object if user object is deleted
        null=False
    )
