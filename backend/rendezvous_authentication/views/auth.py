from django.contrib.auth import logout

from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response

from rendezvous_authentication.models import User
from rendezvous_authentication.serializers.user import UserSerializer
from rendezvous_authentication.utils.oauth.google import google_oauth_login


class AuthViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = UserSerializer

    @action(detail=False, methods=['post'])
    def login(self, request):
        """API endpoint to handle all login requests

        I call the appropriate login method based on the OAuth service mentioned.
        """

        if request.user.is_authenticated:
            response_data = {
                'error': 'You are already logged in.'
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

        oauth_service = request.data.get('oauth_service', None)
        if oauth_service == 'google':
            return google_oauth_login(request)
        else:
            response_data = {
                'error': 'Invalid OAuth Service.'
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['post'])
    def logout(self, request):
        """API endpoint to handle all logout requests

        """

        if request.user.is_authenticated:
            logout(request)
            return Response(
                {'status': 'Successfully logged out'},
                status=status.HTTP_200_OK
            )
        else:
            response_data = {
                'error': 'User is not logged in.'
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=False, methods=['get'])
    def verify(self, request):
        """API endpoint to handle all verify requests

        If user is authenticated, I return the user's data.
        Else, I return a message showing that the user is not authenticated.
        """
        if request.user.is_authenticated:
            user = User.objects.get(username=request.user.username)
            serializer = self.get_serializer_class()(user)
            response_data = {
                'login_status': True,
                'user': serializer.data
            }
        else:
            response_data = {
                'login_status': False,
            }
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )
