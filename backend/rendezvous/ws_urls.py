from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/meeting/(?P<meeting_code>\w+(?:-\w+)+)/room/$', consumers.RoomConsumer.as_asgi()),
]
