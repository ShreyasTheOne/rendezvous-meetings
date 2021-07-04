from django.db import models
from django.conf import settings
from rendezvous.models.base import Base


class Message(Base):
    """
    This models stores information about a message.
    """

    # What does the message say?
    content = models.CharField(
        max_length=128,
        null=False,
        blank=False
    )

    # Who sent it?
    sender = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, # Delete message object if user object is deleted
        null=False
    )

    # When was the message sent?
    send_time = models.DateTimeField(auto_now_add=True)

    class Meta:
        abstract = True
