from django.db import models
from django.contrib.postgres.fields import ArrayField
from rendezvous.models import Meeting
from .base import Base


class Whiteboard(Base):
    """
    This models stores the list of elements
    drawn on a whiteboard for a meeting
    """

    meeting = models.ForeignKey(
        Meeting,
        related_name='whiteboard',
        on_delete=models.CASCADE,  # Delete whiteboard object if user object is deleted
        null=False
    )

    elements = ArrayField(
        models.TextField(
            null=False,
            blank=False
        ),
        blank=True,
        null=True
    )
