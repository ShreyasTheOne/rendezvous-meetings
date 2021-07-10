from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response

from rendezvous.models.conversation import Conversation
from rendezvous.serializers.conversation import ConversationSerializer

from rendezvous_authentication.models import User


class ConversationViewSet(viewsets.ModelViewSet):
    """
    Houses all API endpoints related to conversation
    creation, listing, retrieval and updates.
    """

    queryset = Conversation.objects.all()
    permission_classes = (IsAuthenticated,)
    serializer_class = ConversationSerializer

    @action(detail=False, methods=['post'])
    def start(self, request):
        """
        Handles creation of a new conversation.
        """

        # List of email-ids of the users invited to the conversation
        other_participants = request.data.get('participants_selected', None)

        if not other_participants:
            response_data = {
                'error': 'A conversation must have at least two participants'
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Title of the conversation
        title = request.data.get('title', None)

        # Title of a group chat cannot be empty
        if not title and len(other_participants) > 1:
            response_data = {
                'error': 'Title must be non-empty'
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Create conversation object
        conversation = Conversation(title=title)
        # Save conversation object to the database
        conversation.save()

        # List of participant emails to later send emails to
        participant_emails = []

        conversation.participants.add(request.user)

        # Add participants
        for p in other_participants:
            # participants is a list of emails
            email = p

            # Validate invitee
            if not email:
                continue

            if email is request.user.email:
                participant_emails.append(email)
                continue

            try:
                user = User.objects.get(email=email)
                conversation.participants.add(user)

                participant_emails.append(user.email)
            except User.DoesNotExist:
                pass

        conversation.save()

        response_data = {
            'success': 'Conversation created'
        }
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def edit(self, request):
        """
        Modify title and participants of the conversation
        """

        conversationID = request.data.get('conversation', None)
        inputs = request.data.get('inputs', None)

        if not inputs:
            return Response(status=status.HTTP_400_BAD_REQUEST)

        title = inputs.get('title', None)
        other_participants = inputs.get('participants_selected', None)

        try:
            conversation = Conversation.objects.get(id=conversationID)
        except Conversation.DoesNotExist:
            response_data = {
                'error': 'Invalid conversation'
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

        if not title and len(other_participants) > 1:
            response_data = {
                'error': 'Title must be non-empty.'
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

        conversation.title = title
        conversation.save()

        new_participant_emails = []
        current_participants = conversation.participants.all()

        for p in conversation.participants.all():
            conversation.participants.remove(p)

        conversation.save()

        # Add participants
        for p in other_participants:
            # participants is a list of emails
            email = p

            # Validate invitee
            if not email:
                continue

            try:
                user = User.objects.get(email=email)
                conversation.participants.add(user)

                if user not in current_participants:
                    new_participant_emails.append(user.email)

            except User.DoesNotExist:
                pass

        conversation.save()

        response_data = {
            'success': 'Conversation edited',
        }
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )

    @action(detail=False, methods=['post'])
    def leave(self, request):
        """
        Removes user from the list of the conversation's participants
        """

        conversationID = request.data.get('conversation', None)
        try:
            # Check whether conversation exists
            conversation = Conversation.objects.get(id=conversationID)

            # If user is not in the conversation, the request is invalid
            if request.user not in conversation.participants.all():
                raise Conversation.DoesNotExist

        except Conversation.DoesNotExist:

            response_data = {
                'error': 'Invalid conversation'
            }
            return Response(
                response_data,
                status=status.HTTP_400_BAD_REQUEST
            )

        # Remove user from conversation
        conversation.participants.remove(request.user)

        response_data = {
            'success': 'Removed participant successfully'
        }
        return Response(
            response_data,
            status=status.HTTP_200_OK
        )
