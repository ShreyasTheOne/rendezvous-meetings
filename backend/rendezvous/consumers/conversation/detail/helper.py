from rendezvous.models import PersonalMessage, Meeting


class HelperMixin():
    """
    This mixin houses the helper methods used by the ConversationConsumer
    Helper methods are the methods that:
      - Act on the messages received by the ConversationConsumer
      - Execute logic that is not necessary to be in the consumer itself
      - Call the driver methods of ConversationConsumer to send the message
    """

    def send_message_helper(self, message_content):
        """
        When a user sends a new message in the meeting, a new message instance must be created
        """

        message = PersonalMessage(
            sender=self.user,
            receiver=self.conversation,
            content=message_content
        )

        message.save()
        self.conversation.save()

        self.blast_new_message_driver(message)

    def inform_ongoing_meeting_helper(self):
        """
        If any meeting associated with this conversation is live,
        then inform the participants who are connected to this
        socket
        """

        meetings = Meeting.objects.filter(conversation=self.conversation).order_by('-start_time')
        latest_meeting = meetings.first()

        if latest_meeting and latest_meeting.is_going_on():
            self.blast_ongoing_meeting_driver(latest_meeting)
