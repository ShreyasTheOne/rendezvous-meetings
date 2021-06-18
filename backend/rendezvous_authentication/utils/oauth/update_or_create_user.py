from rendezvous_authentication.models.user import User

def update_or_create_user(user_email, user_name, user_picture):
    """Gets user with matching data.
    If user exists, it updates name and profile picture.
    If user comes for the first time, it creates a new object in database.

    ...

    Parameters
    ----------
    user_email: str
        Validated email address of user
    user_name: str
        Full name of user
    user_picture: str
        URL to the user's profile picture hosted at OAuth service.

    Returns
    -------
    user: User
        Object of User class that matches the given data
    """


    try:
        # Check to see if user exists in database already
        user = User.objects.get(email=user_email)

        # If user exists, update info:
        if user_name is not user.full_name:
            user.full_name = user_name
        if user_picture is not user.profile_picture:
            user.profile_picture = user_picture
        user.save()

    except User.DoesNotExist:

        # If new user, create new user
        user = User(
            email=user_email,
            full_name=user_name,
            profile_picture=user_picture,
        )
        user.save()

    return user
