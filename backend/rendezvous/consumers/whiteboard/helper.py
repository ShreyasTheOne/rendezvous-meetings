from rendezvous.models import Whiteboard


class HelperMixin():
    """
    This mixin houses the helper methods used by the MeetingChatConsumer
    Helper methods are the methods that:
      - Act on the messages received by the MeetingChatConsumer
      - Execute logic that is not necessary to be in the consumer itself
      - Call the driver methods of MeetingChatConsumer to send the message
    """

    def draw_stroke_helper(self, stroke):
        """
        When a user sends a new message in the meeting, a new message instance must be created
        """

        try:
            w = Whiteboard.objects.get(meeting=self.meeting)
            if w.elements:
                w.elements.append(stroke)
            else:
                w.elements = [stroke]
            w.save()
        except Whiteboard.DoesNotExist:
            self.close()

        self.blast_draw_stroke_driver(stroke)
