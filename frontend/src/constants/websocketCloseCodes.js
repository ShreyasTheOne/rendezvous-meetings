const BASE_CODE = 4100

export const MEETING_CODE_INVALID = {
    'code': BASE_CODE,
    'reason': 'Meeting code is invalid.'
}

export const USER_BANNED = {
    'code': BASE_CODE + 1,
    'reason': 'You are not allowed in this meeting.'
}

export const USER_ALREADY_ATTENDING = {
    'code': BASE_CODE + 2,
    'reason': 'Meeting code is invalid.'
}
