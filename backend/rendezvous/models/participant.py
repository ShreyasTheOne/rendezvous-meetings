from django.db import models
from django.conf import settings
from rendezvous.models.base import Base
from rendezvous.models.meeting import Meeting

from rendezvous.constants.participant_status import PARTICIPANT_STATUSES, ATTENDING
from rendezvous.constants.meeting_roles import MEETING_ROLES, SPECTATOR


class Participant(Base):
    """
    This models stores information about a meeting participant.
    It maps to a meeting and a user, and describes their activity status
    and role.
    """

    # Meeting of which the user is/was a participant
    meeting = models.ForeignKey(
        Meeting,
        on_delete=models.CASCADE,
        related_name='participant'
    )

    # User which is/was a participant of the meeting
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='participant'
    )

    # Whether user is CURRENTLY IN, BANNED FROM, or HAS LEFT the meeting
    status = models.CharField(
        max_length=3,
        choices=PARTICIPANT_STATUSES,
        default=ATTENDING
    )

    # Role of the user in the meeting to give permissions
    role = models.CharField(
        max_length=3,
        choices=MEETING_ROLES,
        default=SPECTATOR
    )
