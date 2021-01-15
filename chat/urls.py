from django.urls import path, re_path
from .views import CallView


urlpatterns = [
    path('call/', CallView.as_view({
        'post': 'post'
    }), name="call"),
]
