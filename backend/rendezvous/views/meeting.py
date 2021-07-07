from datetime import datetime

from django.utils import timezone
from django.db.models import Q

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from rendezvous.models.meeting import Meeting
from rendezvous.serializers.meeting import MeetingCreatedSerializer, MeetingEmailSerializer, MeetingVerboseSerializer
from rendezvous.tasks.meeting_invite import send_meeting_invite_notifications

from rendezvous_authentication.models import User


class MeetingViewSet(viewsets.ModelViewSet):
    """
    Houses all API endpoints related to meeting creation, listing,
    retrieval and updates.
    """

    queryset = Meeting.objects.all()
    permission_classes = (IsAuthenticated,)

    @action(detail=False, methods=['post'])
    def instant(self, request):
        """
        Handles instant meeting creation.
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
            'success': 'Meeting created',
            'meeting_code': meeting.code
        }
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def custom(self, request):
        """
        Handles custom meeting creation.
        """

        # Destructure request data
        title = request.data.get('title', None)
        description = request.data.get('description', None)
        invitees = request.data.get('invitees_selected', None)
        scheduled_start_time = request.data.get('scheduled_start_time', None)
        start_now = request.data.get('start_now', None)

        # Validate start time
        now = timezone.now()

        if start_now is True:
            scheduled_datetime_obj = now
        elif scheduled_start_time is not None:

            try:
                scheduled_datetime_obj = datetime.strptime(scheduled_start_time, "%d-%m-%Y %H:%M")
                if scheduled_datetime_obj < now:
                    raise
            except Exception:
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
            scheduled_start_time=scheduled_datetime_obj,
            host=request.user,
        )
        meeting.save()

        invitee_emails = []
        # Add invitees
        for inv in invitees:
            # invitees is a list of emails of those invited
            email = inv

            # Validate invitee
            if not email or email is request.user.email:
                continue

            try:
                user = User.objects.get(email=email)
                meeting.invitees.add(user)

                invitee_emails.append(user.email)
            except User.DoesNotExist:
                pass

        meeting.save()

        # Send invite email
        if len(invitee_emails) > 0:
            send_meeting_invite_notifications.delay(
                meeting=MeetingEmailSerializer(meeting).data,
                user_emails=invitee_emails
            )

        """
        We do not add the host as a participant here
        We add the host as a participant when the websocket
        Connection is created
        """

        response_data = {
            'success': 'Meeting created',
            'meeting': MeetingCreatedSerializer(meeting).data
        }
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def check_host_status(self, request):
        """
        Returns True if the user that makes the request
        is the host of the meeting associated with the host specified.
        """

        code = request.data.get('code', None)
        host_status = False

        if code:
            try:
                meeting = Meeting.objects.get(code=code)
                host_status = request.user.uuid == meeting.host.uuid
            except:
                pass

        response_data = {
            'status': host_status
        }
        return Response(response_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """
        Returns a list of all future meetings that the user has hosted, or is invited to,
        in reverse-chronological order of the scheduled start times.
        """

        meetings = Meeting.objects.filter(
            (Q(host=request.user)
             | Q(invitees__in=[request.user]))
            & Q(scheduled_start_time__gt=timezone.now())
        ).order_by('-scheduled_start_time')

        response_data = {
            'upcoming_meetings': MeetingVerboseSerializer(meetings, many=True).data
        }

        return Response(
            response_data,
            status=status.HTTP_200_OK
        )
