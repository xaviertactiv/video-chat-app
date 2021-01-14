from django.shortcuts import _get_queryset


def get_object_or_none(klass, *args, **kwargs):
    """ try to return the class instance and
        return None if none existent.
    """
    queryset = _get_queryset(klass)
    try:
        return queryset.get(*args, **kwargs)
    except queryset.model.DoesNotExist:
        return None