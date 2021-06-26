import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'rendezvous_backend.settings')

from django.core.asgi import get_asgi_application

from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
import rendezvous.ws_urls

django_asgi_app = get_asgi_application()
application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": AuthMiddlewareStack(
        URLRouter(
            rendezvous.ws_urls.websocket_urlpatterns
        )
    ),
})
