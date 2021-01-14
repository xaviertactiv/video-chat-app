""" This script contains the serializers of the endpoints
    for the user module.
"""
import datetime

from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.utils import timezone
from django.utils.translation import ugettext_lazy as _

from rest_framework import serializers
from rest_framework.authtoken.models import Token


class AuthTokenSerializer(serializers.Serializer):
    """ auth token serializer
    """
    user = None

    email = serializers.CharField(write_only=True)
    password = serializers.CharField(write_only=True)

    def __init__(self, *args, **kwargs):
        self.request = kwargs.pop('request', None)
        super(AuthTokenSerializer, self).__init__(*args, **kwargs)

    def validate(self, data):
        """ validate email credentials
        """
        email, password = data.values()

        if not email or not password:
            msg = _('Must include "email" and "password".')
            raise serializers.ValidationError(msg, code='authorization')

        self.user = authenticate(request=self.request,
                                 email=email, password=password)

        if not self.user:
            msg = _('Unable to log in with provided credentials.')
            raise serializers.ValidationError(msg, code='authorization')

        return data

    def get_token(self):
        """ get or generate a user token that is valid for
            `settings.AUTH_TOKEN_EXPIRY_TIME`
        """
        if not self.user:
            msg = _('Unable to login with provided credentials.')
            raise serializers.ValidationError(msg, code="authorization")

        token, created = Token.objects.get_or_create(user=self.user)
        expiry_date = token.created + datetime.timedelta(
            days=settings.AUTH_TOKEN_EXPIRY_TIME)

        if not created and expiry_date < timezone.now():
            # delete token
            token.delete()
            # generate a new one
            token = Token.objects.create(user=self.user)

        return token


class UserSerializer(serializers.ModelSerializer):
    """ user serializer
    """
    client = serializers.SerializerMethodField()
    contractor = serializers.SerializerMethodField()

    class Meta:
        model = get_user_model()
        fields = (
            'id',
            'email',
            'first_name',
            'last_name',
            'image',
            'date_joined',
            'is_client',
            'client',
            'contractor'
        )