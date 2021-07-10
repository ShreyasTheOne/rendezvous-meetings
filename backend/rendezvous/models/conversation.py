from django.db import models
from django.conf import settings

from rendezvous.models.base import Base


class Conversation(Base):
    """
    This models stores information about the
    conversation between two users
    """

    # List of users in the conversation
    participants = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='conversations',
        blank=True,
    )

    # Title of the conversation
    title = models.CharField(
        max_length=255,
        default=None,
        null=True,
        blank=True,
    )
