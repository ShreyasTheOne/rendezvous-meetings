from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    # Meeting and video call routes
    re_path(r'ws/meeting/(?P<meeting_code>\w+(?:-\w+)+)/room/$', consumers.RoomConsumer.as_asgi()),
    re_path(r'ws/meeting/(?P<meeting_code>\w+(?:-\w+)+)/video_call/$', consumers.VideoCallConsumer.as_asgi()),
    re_path(r'ws/meeting/(?P<meeting_code>\w+(?:-\w+)+)/chat/$', consumers.MeetingChatConsumer.as_asgi()),
    re_path(r'ws/meeting/(?P<meeting_code>\w+(?:-\w+)+)/whiteboard/$', consumers.WhiteboardConsumer.as_asgi()),

    # Conversation routes
    re_path(r'ws/conversations/$', consumers.WorldConversationConsumer.as_asgi()),
    re_path(r'ws/conversations/(?P<conversation_id>\w+(?:-\w+)+)/$', consumers.ConversationConsumer.as_asgi()),
]
