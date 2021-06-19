from django.utils import timezone

from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from rendezvous.models.meeting import Meeting

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
