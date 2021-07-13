from rendezvous_authentication.serializers.user import UserVolumeSerializer


def get_users_from_participants(participants):
    """ Generates a list of users from a list of participant objects

    Send POST request to google to get encrypted JWT Token in response
    Decode JWT token to get user data and log the user into our app

    ...

    Parameters
    ----------
    participants: QuerySet
        A QuerySet of Participant objects

    Returns
    -------
    Response: list
        A list of users associated with each participant object
    """

    users = []
    for p in participants:
        users.append(p.user)

    return UserVolumeSerializer(users, many=True).data
