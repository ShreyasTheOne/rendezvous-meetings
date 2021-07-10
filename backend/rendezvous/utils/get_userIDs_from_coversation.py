def get_userIDs_from_coversation(conversation):
    """
    Returns a list of the IDs of all the
    users participating in the conversation
    """

    ids = []
    for p in conversation.participants.all():
        ids.append(p.get_uuid_str())

    return ids
