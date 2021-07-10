const BASE_CODE = 4100

export const MEETING_CODE_INVALID = {
    'code': BASE_CODE,
    'reason': 'Meeting code is invalid.'
}

export const YOU_ARE_BANNED = {
    'code': BASE_CODE + 1,
    'reason': 'You have been banned from this meeting.'
}

export const YOU_ARE_ALREADY_ATTENDING = {
    'code': BASE_CODE + 2,
    'reason': 'You are already attending the meeting.'
}

export const YOU_ARE_REMOVED = {
    'code': BASE_CODE + 3,
    'reason': 'You have been removed from this meeting.'
}

export const CONVERSATION_ID_INVALID = {
    'code': BASE_CODE + 4,
    'reason': 'Conversation id is invalid.'
}
