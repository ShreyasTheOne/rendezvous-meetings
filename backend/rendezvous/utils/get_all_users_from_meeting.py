from django.db.models import Q

from rendezvous.models import Meeting, Participant
from rendezvous.constants import participant_status

from rendezvous_authentication.serializers.user import UserVolumeSerializer

from .get_users_from_participants import get_users_from_participants


def get_all_users_from_meeting(meeting_id, time_period):
    """
    Returns a serialised list of all the users that had:
    - Hosted the meeting
    - Attended the meeting
    - Had been invited to the meeting
    """

    if time_period == 'PAST':
        participants = Participant.objects.filter(
            Q(meeting_id=meeting_id)
            & (Q(status=participant_status.ATTENDING) | Q(status=participant_status.LEFT))
        )
        users_list = get_users_from_participants(participants)
    elif time_period == 'UPCOMING':
        try:
            meeting = Meeting.objects.get(id=meeting_id)
            users_invited = meeting.invitees.all()
            host = meeting.host
            users_list = [
                *UserVolumeSerializer(users_invited, many=True).data,
                UserVolumeSerializer(host).data
            ]
        except Meeting.DoesNotExist:
            return []
    else:
        return []

    return users_list
