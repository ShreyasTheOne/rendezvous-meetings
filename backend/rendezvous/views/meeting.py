from django.utils import timezone
from datetime import datetime

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from rendezvous.models.meeting import Meeting
from rendezvous.serializers.meeting import MeetingShallowSerializer

from rendezvous_authentication.models import User

class MeetingViewSet(viewsets.ModelViewSet):
    queryset = Meeting.objects.all()
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['post'])
    def instant(self, request):
        """API endpoint to handle instant meeting creation
        """

        title = request.data.get('title', None)

        # Create meeting
        meeting = Meeting(
            title=title,
            host=request.user,
            start_time=timezone.now()
        )
        meeting.save()

        """
        We do not add the host as a participant here
        We add the host as a participant when the websocket
        Connection is created
        """

        response_data = {
            'meeting_code': meeting.code
        }
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def custom(self, request):
        """API endpoint to handle custom meeting creation
        """

        # Destructure request data
        title = request.data.get('title', None)
        description = request.data.get('description', None)
        invitees = request.data.get('invitees', None)
        scheduled_start_time = request.data.get('scheduled_start_time', None)
        start_now = request.data.get('start_now', None)

        # Validate start time
        now = datetime.now()

        if start_now is True:
            scheduled_datetime_obj = now
        elif scheduled_start_time is not None:
            scheduled_datetime_obj = datetime.strptime(scheduled_start_time, "%Y-%m-%dT%H:%M")
            if scheduled_datetime_obj < now:
                response_data = {
                    'error': "Invalid start time.",
                }
                return Response(
                    response_data,
                    status=status.HTTP_400_BAD_REQUEST
                )
        else:
            # Neither start now nor valid start time provided
            response_data = {
                'error': "Invalid start time.",
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create meeting
        meeting = Meeting(
            title=title,
            description=description,
            start_time=scheduled_datetime_obj,
            host=request.user,
        )
        meeting.save()

        # Add invitees
        for inv in invitees:
            uuid = inv.get('uuid')

            # Validate invitee
            if not uuid or uuid is request.user.uuid:
                continue

            try:
                user = User.objects.get(uuid=uuid)
                meeting.invitees.add(user)
            except User.DoesNotExist:
                pass

        meeting.save()

        """
        We do not add the host as a participant here
        We add the host as a participant when the websocket
        Connection is created
        """

        response_data = {
            'success': 'Meeting object created',
            'meeting': MeetingShallowSerializer(meeting).data
        }
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )
