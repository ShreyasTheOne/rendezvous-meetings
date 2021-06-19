from django.urls import path, include
from rest_framework import routers

from rendezvous.views import *

router = routers.SimpleRouter()

router.register(r'meeting', MeetingViewSet, basename='meeting')

urlpatterns = [
    path('', include(router.urls)),
]
