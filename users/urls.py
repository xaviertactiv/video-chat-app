from django.urls import path, re_path
from .views import Login, AuthUser


urlpatterns = [
    path('auth/', AuthUser.as_view({
        'get': 'get'
    }), name="auth_user"),
    path('auth/login/', Login.as_view(), name="login"),
]
