import json
from asgiref.sync import async_to_sync

from rendezvous.models import Participant
from rendezvous.serializers.meeting import MeetingShallowSerializer
from rendezvous.utils.get_users_from_participants import get_users_from_participants
from rendezvous.constants import participant_status, websocket_message_types

from rendezvous_authentication.serializers.user import UserSerializer

class DriverMixin():
    """
    This mixin houses the driver methods used by the RoomConsumer
    Driver methods are the methods that:
      - Create the message object to be sent
      - Call the 'send()' method of WebsocketConsumer to send the message

    These driver methods are called by the helper methods.
    The code for message creation and sending is kept separate to prevent clutter

    There are two types of methods:
    - send methods
      - These methods send a message to self
      - For example: send_meeting_info()
    - blast methods
      - These methods send a message to everyone in the room
      - For example: blast_user_joined()
    """

    def send_meeting_info_driver(self, target ='self'):
        """
        Sends general information about meeting to the specified user.
        If no user is specified, it sends the information to self

        Information sent about the meeting:
          - Title
          - Code
          - Description
          - Host
        This is an indicator that the user has been admitted to the meeting
        """
        message = {
            'type': websocket_message_types.MEETING_INFORMATION,
            'message': MeetingShallowSerializer(self.meeting).data
        }
        if target == 'self':
            self.send(text_data=json.dumps(message))
        else:
            message['uuid'] = target
            async_to_sync(self.channel_layer.group_send)(
                self.room_name,
                {
                    'type': "send_info_to_user",
                    'message': message
                }
            )

    def send_participants_info_driver(self):
        """
        Sends list of users in the meeting when he/she joins
        """

        participants = Participant.objects.filter(
            meeting=self.meeting,
            status=participant_status.ATTENDING
        )
        users_data = get_users_from_participants(participants)

        message = {
            'type': websocket_message_types.PARTICIPANT_LIST,
            'message': users_data
        }
        self.send(
            text_data=json.dumps(message)
        )

    def blast_user_joined_driver(self):
        """
        Inform everyone in the meeting that a new user (self) has joined
        """

        message = {
            'type': websocket_message_types.USER_JOINED,
            'message': 'A user has joined the meeting'
        }
        async_to_sync(self.channel_layer.group_send)(
            self.room_name,
            {
                'type': "send_info_to_all",
                'message': message,
            }
        )

    def send_rejected_message_driver(self, target=None):
        if not target:
            return
        else:
            async_to_sync(self.channel_layer.group_send)(
                self.room_name,
                {
                    'type': "send_rejected_message",
                    'message': {
                        "uuid": target
                    }
                }
            )

    """
    One of the following criteria needs to be met for a user to be directly allowed in the meeting:
      - The user is the host of the meeting
      - The user is an invitee of the meeting
      - The user is has been admitted by the host before

    If none of the above criteria is satisfied, a request is sent to the host to admit the new user
    The following methods handle different cases that can arise in this situation
    """

    def send_pending_host_permission_message(self):
        """
        In this case, 'self' is the new user, and self is informed that they are waiting for the host to admit them
        """
        message = {
            'type': websocket_message_types.PENDING_HOST_PERMISSION,
            'message': 'Waiting for the host to let you in'
        }
        self.send(
            text_data=json.dumps(message)
        )

    def send_pending_host_join_message(self):
        """
        In this case, the host has not joined the meeting yet.
        self (The user waiting in the lobby) is informed of the same
        """
        message = {
            'type': websocket_message_types.PENDING_HOST_JOIN,
            'message': 'Waiting for the host to join'
        }
        self.send(
            text_data=json.dumps(message)
        )

    def ask_host_for_permission(self):
        """
        In this case, the host has already joined the meeting. A request is sent to him to
        allow this user into the meeting
        """

        message = {
            'type': websocket_message_types.PENDING_HOST_PERMISSION,
            'message': [UserSerializer(self.user).data],
        }
        async_to_sync(self.channel_layer.group_send)(
            self.room_name,
            {
                'type': "send_info_to_host",
                'message': message,
            }
        )

    def blast_pending_host_permission_message(self):
        """
        In the case that the host is not present in the meeting, then the list of people waiting in the lobby must
        be sent to the host once he/she joins.

        This function is called when the host joins.
        Everyone is informed that the host has joined, and the host is sent the list of users waiting in the lobby
        """

        # Inform everyone in the lobby that the host has joined and will review their join requests
        message = {
            'type': websocket_message_types.PENDING_HOST_PERMISSION,
            'message': 'Waiting for the host to let you in'
        }
        # Send to everyone but host
        async_to_sync(self.channel_layer.group_send)(
            self.room_name,
            {
                'type': "send_info_to_all_but_host",
                'message': message,
            }
        )

        # Gather list of participants waiting in the lobby
        participants_waiting = Participant.objects.filter(
            meeting=self.meeting,
            status=participant_status.WAITING_IN_LOBBY
        )
        # Extract users from the list of participants
        users_list = get_users_from_participants(participants_waiting)

        # Craft message
        message = {
            'type': websocket_message_types.PENDING_HOST_PERMISSION,
            'message': users_list
        }

        # Send to self (self is always HOST)
        self.send(
            text_data=json.dumps(message)
        )
