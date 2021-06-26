from rendezvous_authentication.serializers.user import UserVolumeSerializer


def get_users_from_participants(participants):
    """
    Generates a list of users from a list of participant objects

    @param participants: Queryset of participant objects
    @returns: a list of users associated with each participant object
    """

    users = []
    for p in participants:
        users.append(p.user)

    return UserVolumeSerializer(users, many=True).data
