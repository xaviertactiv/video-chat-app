def user_media_path(obj, filename):
    """ set media path dynamically based
        on the user id.
    """
    return f"users/{obj.id}/avatar/{filename}"