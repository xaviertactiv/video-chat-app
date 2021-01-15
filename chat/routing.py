from django.urls import path

from .consumers import CallConsumer

websocket_urlpatterns = [
    path(r'ws/call/<int:id>/', CallConsumer.as_asgi()),
]