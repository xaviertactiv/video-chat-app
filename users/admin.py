""" This script defines the user module admin
    panel configuration.
"""
from django.contrib import admin
from django.contrib.auth import get_user_model
from django.contrib.auth.admin import UserAdmin as DefaultUserConfig
from django.utils.translation import gettext_lazy as _

from rest_framework.authtoken.models import Token

admin.site.unregister(Token)


class TokenAdmin(admin.TabularInline):
    """ auth token admin panel
    """
    model = Token
    readonly_fields = ('key',)


@admin.register(get_user_model())
class UserAdmin(DefaultUserConfig):
    """ user admin panel configuration
    """
    model = get_user_model()
    readonly_fields = ('date_joined',)
    ordering = ('email',)

    filter_horizontal = ('groups', 'user_permissions')
    list_display = ('email', 'first_name', 'last_name', 'date_joined')
    inlines = (TokenAdmin,)

    fieldsets = (
        (None, {
            'fields': ('email', 'password')
        }),
        (_('Personal info'), {
            'fields': ('first_name', 'last_name', 'image')
        }),
        (_('Permissions'), {
            'fields': ('is_active', 'is_staff', 'is_superuser',
                       'groups', 'user_permissions')
        }),
        (_('Important dates'), {
            'fields': ('last_login', 'date_joined')
        })
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2'),
        }),
    )

