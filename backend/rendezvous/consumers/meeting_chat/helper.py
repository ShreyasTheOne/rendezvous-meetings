from rendezvous.models import MeetingMessage


class HelperMixin():
    """
    This mixin houses the helper methods used by the MeetingChatConsumer
    Helper methods are the methods that:
      - Act on the messages received by the MeetingChatConsumer
      - Execute logic that is not necessary to be in the consumer itself
      - Call the driver methods of MeetingChatConsumer to send the message
    """

    def send_message_helper(self, message_content):
        """
        When a user sends a new message in the meeting, a new message instance must be created
        """

        message = MeetingMessage(
            sender=self.user,
            receiver=self.meeting,
            content=message_content
        )

        message.save()

        self.blast_new_message_driver(message)
