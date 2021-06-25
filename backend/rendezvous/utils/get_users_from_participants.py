from rendezvous_authentication.serializers.user import UserVolumeSerializer


def get_users_from_participants(participants):
    users = []
    for p in participants:
        users.append(p.user)

    return UserVolumeSerializer(users, many=True).data
