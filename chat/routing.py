from django.urls import path

from .consumers import ChatConsumer

websocket_urlpatterns = [
    path(r'ws/call/<int:id>/', ChatConsumer.as_asgi()),
    path(r'ws/room/<slug:id>/', ChatConsumer.as_asgi()),
]