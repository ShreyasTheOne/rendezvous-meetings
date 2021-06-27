from asgiref.sync import async_to_sync

from rendezvous.constants import participant_status
from rendezvous.models import Participant

from rendezvous_authentication.models import User


class HelperMixin():
    """
    This mixin houses the helper methods used by the RoomConsumer
    Helper methods are the methods that:
      - Act on the messages received by the RoomConsumer
      - Execute logic that is not necessary to be in the consumer itself
      - Call the driver methods of RoomConsumer to send the message
    """

    def __update_participant_status(self, user_uuid, new_status):
        """
        Updates the participant status, as specified in the parameters
        """
        try:
            participant = Participant.objects.get(
                meeting=self.meeting,
                user__uuid=user_uuid,
            )
            participant.status = new_status
            participant.save()
        except Participant.DoesNotExist:
            _ = Participant.objects.create(
                meeting=self.meeting,
                user=(User.objects.get(uuid=user_uuid)),
                status=new_status
            )
        return

    def admit_user(self, user_uuid):
        """
        Accepts a user that was waiting in the lobby, into the meeting
        This method sends meeting information to the user, which is only sent to
        those participants that have been accepted into the meeting
        """
        self.__update_participant_status(user_uuid, participant_status.ATTENDING)
        self.send_meeting_info_driver(user_uuid)
        self.blast_user_joined_driver(user_uuid)

    def reject_user(self, user_uuid):
        """
        Host rejects a user that was waiting in the lobby
        This method creates a participant of the user with status banned so that
        her won't bother the host again
        """

        self.__update_participant_status(user_uuid, participant_status.BANNED)
        self.send_rejected_message_driver(user_uuid)

    def handle_join(self):
        """
        The connect() method of the RoomConsumer checks verifies the user.
        If the user meets either one of the following criteria...:
          - The user is the host of the meeting
          - The user is an invitee of the meeting
          - The user is has been admitted by the host before
        ...the user is allowed to enter the meeting

        This method handles the situation after the user is allowed
        It sends the following information to the new user:
          - Information about the meeting
          - List of users in the meeting
          - It informs everyone else in the meeting that a new user has joined
        """

        # Add self to room group, to send/receive all messages to/from that channel
        async_to_sync(self.channel_layer.group_add)(
            self.room_name,
            self.channel_name
        )

        # Update participant status of self
        self.__update_participant_status(self.user.uuid, participant_status.ATTENDING)

        # Tell everyone else that a new user joined
        self.blast_user_joined_driver(self.user.get_uuid_str())

        # Send meeting information to self
        self.send_meeting_info_driver()

        return

    def add_to_waiting_list(self):
        """
        When an uninvited user tries to enter the meeting and the host is not in the meeting
        to admit this user, the user is added to the waiting 'lobby'

        In technical terms, a participant object is created and stored in the database
        with the status as 'WAITING_IN_LOBBY'. These objects are queried later then the host joins.
        """

        _ = Participant.objects.get_or_create(
            user=self.user,
            meeting=self.meeting,
            status=participant_status.WAITING_IN_LOBBY
        )
