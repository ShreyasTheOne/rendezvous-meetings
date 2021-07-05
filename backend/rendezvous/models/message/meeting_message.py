from django.db import models
from rendezvous.models import Meeting
from .base import Message


class MeetingMessage(Message):
    """
    This models stores information about a message sent in a meeting.
    """

    receiver = models.ForeignKey(
        Meeting,
        related_name='message',
        on_delete=models.CASCADE,  # Delete message object if user object is deleted
        null=False
    )
