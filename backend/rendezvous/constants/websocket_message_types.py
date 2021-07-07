MEETING_INFORMATION = 'MEETING_INFORMATION'
PARTICIPANT_LIST = 'PARTICIPANT_LIST'
HOST_JOINED = 'HOST_JOINED'
USER_JOINED = 'USER_JOINED'
USER_LEFT = 'USER_LEFT'

PENDING_HOST_PERMISSION = 'PENDING_HOST_PERMISSION'
PENDING_HOST_JOIN = 'PENDING_HOST_JOIN'
ASK_HOST_PERMISSION_TO_ENTER = 'ASK_HOST_PERMISSION_TO_ENTER'

ADMIT_USER = 'ADMIT_USER'
REJECT_USER = 'REJECT_USER'
BAN_USER = 'BAN_USER'
REMOVE_USER = 'REMOVE_USER'

ICE_CANDIDATE = 'ICE_CANDIDATE'
PEER_CONNECTION_OFFER = 'PEER_CONNECTION_OFFER'
PEER_CONNECTION_ANSWER = 'PEER_CONNECTION_ANSWER'

generic_message_types = [
    ICE_CANDIDATE, PEER_CONNECTION_ANSWER, PEER_CONNECTION_OFFER
]

VIDEO_TURNED_OFF = 'VIDEO_TURNED_OFF'
AUDIO_TURNED_OFF = 'AUDIO_TURNED_OFF'
media_control_types = [VIDEO_TURNED_OFF, AUDIO_TURNED_OFF]

MESSAGES_LIST = 'MESSAGES_LIST'
NEW_MESSAGE = 'NEW_MESSAGE'
SEND_MESSAGE = 'SEND_MESSAGE'

WHITEBOARD_DRAW_STROKE = 'WHITEBOARD_DRAW_STROKE'
INITIALISE_WHITEBOARD = 'INITIALISE_WHITEBOARD'
