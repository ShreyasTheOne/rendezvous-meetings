from django.urls import re_path

from . import consumers

websocket_urlpatterns = [
    re_path(r'ws/meeting/(?P<meeting_code>\w+(?:-\w+)+)/video_call/$', consumers.VideoCallConsumer.as_asgi()),
]
#
# from django.urls import path
#
# from . import consumers
#
# websocket_urlpatterns = [
#     path('ws/meeting/<slug:meeting_code>/video_call/$', consumers.VideoCallConsumer.as_asgi()),
# ]

