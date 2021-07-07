import json
from asgiref.sync import async_to_sync

from rendezvous.models import Whiteboard
from rendezvous.serializers.whiteboard import WhiteboardSerializer
from rendezvous.constants import websocket_message_types


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

    def initialise_whiteboard_driver(self):
        """
        Sends the list of all the elements that the users have added to the
        whiteboard till now
        """
        try:
            w = Whiteboard.objects.get(meeting=self.meeting)
        except Whiteboard.DoesNotExist:
            w = Whiteboard(meeting=self.meeting)
            w.save()

        message = {
            'type': websocket_message_types.INITIALISE_WHITEBOARD,
            'message': WhiteboardSerializer(w).data
        }

        self.send(
            text_data=json.dumps(message)
        )

    def blast_draw_stroke_driver(self, stroke):
        """
        Delivers the new draw stroke to everyone in the meeting
        """

        message = {
            'type': websocket_message_types.WHITEBOARD_DRAW_STROKE,
            'message': stroke,
            'uuid': self.user.get_uuid_str()
        }

        async_to_sync(self.channel_layer.group_send)(
            self.whiteboard_group_name,
            {
                'type': "send_info_to_all_but_user",
                'message': message
            }
        )
