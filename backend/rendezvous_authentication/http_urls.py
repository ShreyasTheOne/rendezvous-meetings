from django.urls import path, include
from rest_framework import routers

from rendezvous_authentication.views import *

router = routers.SimpleRouter()

router.register(r'', AuthViewSet, basename='auth')

urlpatterns = [
    path('', include(router.urls)),
]
