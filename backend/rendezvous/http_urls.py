from django.urls import path, include
from rest_framework import routers

from rendezvous.views import *

router = routers.SimpleRouter()

router.register(r'meeting', MeetingViewSet, basename='meeting')
router.register(r'conversation', ConversationViewSet, basename='conversation')
router.register(r'search_users', UserViewSet, basename='search users')

urlpatterns = [
    path('', include(router.urls)),
]
