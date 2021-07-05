import json
from asgiref.sync import async_to_sync

from rendezvous.models import Participant
from rendezvous.constants import participant_status, websocket_message_types
from rendezvous.utils.get_users_from_participants import get_users_from_participants

from rendezvous_authentication.models import User
from rendezvous_authentication.serializers.user import UserVolumeSerializer


class DriverMixin():
    """
    This mixin houses the driver methods used by the VideoCallConsumer
    Driver methods are the methods that:
      - Create the message object to be sent
      - Call the 'send()' method of WebsocketConsumer to send the message

    These driver methods are called by the helper methods.
    The code for message creation and sending is kept separate to prevent clutter

    There are two types of methods:
    - send methods
      - These methods send a message to self
      - For example: send_participants_list()
    - blast methods
      - These methods send a message to everyone in the room
      - For example: blast_user_joined()
    """

    def send_participants_info_driver(self):
        """
        Sends list of participants in the meeting to self
        """

        # Get all active participants in our meeting
        participants = Participant.objects.filter(
            meeting=self.meeting,
            status=participant_status.ATTENDING
        )
        users_list = get_users_from_participants(participants)
        message = {
            'type': websocket_message_types.PARTICIPANT_LIST,
            'message': users_list
        }
        self.send(
            text_data=json.dumps(message)
        )

    def send_generic_video_call_signal_driver(self, type, message):
        """
        Sends the signal to the intended target user while the peer connection is being created
        """

        # Get the target user
        target_uuid = message.get('target_userID', None)
        if not target_uuid: return

        message = {
            'type': type,
            'message': message,
            'uuid': target_uuid
        }

        async_to_sync(self.channel_layer.group_send)(
            self.video_call_group_name,
            {
                'type': "send_info_to_user",
                'message': message,
            }
        )

    def blast_generic_video_call_signal_driver(self, message):
        """
        Sends a message to everyone in the group call
        """

        async_to_sync(self.channel_layer.group_send)(
            self.video_call_group_name,
            {
                'type': "send_info_to_all",
                'message': message,
            }
        )

    def blast_user_left_driver(self, user_uuid):
        """
        Inform everyone in the meeting that a user (self) has left
        """

        message = {
            'type': websocket_message_types.USER_LEFT,
            'message': UserVolumeSerializer(User.objects.get(uuid=user_uuid)).data,
            'uuid': user_uuid
        }
        async_to_sync(self.channel_layer.group_send)(
            self.video_call_group_name,
            {
                'type': "send_info_to_all_but_user",
                'message': message,
            }
        )
