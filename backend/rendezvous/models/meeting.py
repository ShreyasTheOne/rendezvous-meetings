import os
from django.db import models
from django.conf import settings

from rendezvous.models.conversation import Conversation
from rendezvous.models.base import Base
from rendezvous.utils.generate_random_code import generate_random_code


class Meeting(Base):
    """
    This models stores information about a meeting.
    """

    # Unique 11 character string containing lowercase alphabets of the form xxx-xxx-xxx
    code = models.CharField(
        max_length=15,
        default=generate_random_code,
        unique=True,
    )

    # Meeting title set by host
    title = models.CharField(
        max_length=255,
        default=None,
        null=True,
        blank=True,
    )

    # Meeting description/agenda set by the host
    description = models.TextField(
        default=None,
        null=True,
        blank=True,
    )

    # Scheduled start time (If meeting is scheduled)
    scheduled_start_time = models.DateTimeField(
        null=True,
        default=None,
    )

    # Time when first participant enters
    start_time = models.DateTimeField(
        null=True,
        default=None,
    )

    # Time when last participant leaves
    end_time = models.DateTimeField(
        null=True,
        default=None,
    )

    # Foreign key to meeting host user
    host = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name='meeting_hosted',
        on_delete=models.SET_NULL,  # If host account is deleted, set this field to NULL
        null=True,  # Allow this field to be set to null
    )

    # List of users invited
    invitees = models.ManyToManyField(
        settings.AUTH_USER_MODEL,
        related_name='meeting_invited_to',
        blank=True,
    )

    # Conversation to which the meeting is associated (if any)
    conversation = models.ForeignKey(
        Conversation,
        related_name='meeting',
        on_delete=models.SET_NULL, # If the conversation is deleted, maintain the meeting information
        null=True, # Allow this field to be set to null
        default=None
    )

    def has_started(self):
        """
        If meeting has started, start time exists
        """

        if self.start_time is None:
            # Meeting hasn't started even once
            return False
        if self.end_time is None:
            # Meeting has start once and not ended
            return True
        # Meeting had ended and was started again
        return self.start_time > self.end_time

    def has_ended(self):
        """
        If meeting has ended, end time exists
        """
        if self.end_time is None:
            # Meeting hasn't ended even once
            return False
        if self.start_time is None:
            # Meeting hasn't even started yet
            return False
        # Meeting had ended and started again
        return self.end_time > self.start_time

    def is_going_on(self):
        """
        If meeting is going on, it has started and not ended
        """
        return self.has_started() and not self.has_ended()

    def get_host_name(self):
        """
        Return full name of meeting host
        """
        return self.host.full_name

    def get_joining_link(self):
        """
        Returns the link URI at which the user can attend the meeting
        """
        return f"{os.environ.get('FRONTEND_MEETING_URI_BASE')}{self.code}"

    def get_scheduled_time_formatted(self):
        """
        Return readable scheduled start time
        """
        return self.scheduled_start_time.strftime("%m/%d/%Y, %H:%M:%S")

    def get_scheduled_time_str(self):
        """
        Convert scheduled start datetime object to string
        """
        if not self.scheduled_start_time:
            return ''
        return str(self.scheduled_start_time)

    def get_start_time_str(self):
        """
        Convert scheduled start datetime object to string
        """
        if not self.start_time:
            return ''
        return str(self.start_time)

    def get_end_time_str(self):
        """
        Convert scheduled start datetime object to string
        """
        if not self.end_time:
            return ''
        return str(self.end_time)

    def __str__(self):
        return f'{self.title} : {self.code}'
