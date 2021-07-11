import config from './configuration/config.json'

const frontendBaseUrl = config.frontendBaseUrl
const backendBaseHTTP = config.backendBaseHTTP
const backendBaseWS = config.backendBaseWS

// Frontend Routes

export const routeBase = () => {
    return frontendBaseUrl
}

export const routeHome = () => {
    return `${routeBase()}`
}

export const routeRedirect = () => {
    return `${routeBase()}redirect/`
}

export const routeConversations = () => {
    return `${routeBase()}conversations/`
}

export const routeMeetings = () => {
    return `${routeBase()}meetings/`
}

export const routeMyMeetingsDetail = uuid => {
    if (!uuid) return routeMeetings()
    return `${routeMeetings()}${uuid}/`
}

export const routeMeeting = code => {
    return `${routeBase()}meet/${code}`
}

export const route404 = () => {
    return `${routeBase()}404/`
}

// Backend HTTP URLs

const backendUrl = () => {
    return backendBaseHTTP
}

const authBase = () => {
    return `${backendUrl()}auth/`
}

const apiBase = () => {
    return `${backendUrl()}api/`
}

export const authVerifyUrl = () => {
    return `${authBase()}verify/`
}

export const authLoginUrl = () => {
    return `${authBase()}login/`
}

export const authLogoutUrl = () => {
    return `${authBase()}logout/`
}

export const apiCreateInstantMeetingUrl = () => {
    return `${apiBase()}meeting/instant/`
}

export const apiCreateCustomMeetingUrl = () => {
    return `${apiBase()}meeting/custom/`
}

export const apiMyMeetingsUrl = () => {
    return `${apiBase()}meeting/my_meetings/`
}

export const apiUserSearchUrl = (query, dropdown = false, get_all = false) => {
    let url = `${apiBase()}search_users/?search=${query}`
    if (dropdown) url += `&for=dropdown`
    if (get_all) url += `&get_all=true`

    return url
}

export const apiCreateConversationUrl = () => {
    return `${apiBase()}conversation/start/`
}

export const apiConversationEditUrl = () => {
    return `${apiBase()}conversation/edit/`
}

export const apiConversationLeaveUrl = () => {
    return `${apiBase()}conversation/leave/`
}

export const apiIAmTheMeetingHostUrl = () => {
    return `${apiBase()}meeting/check_host_status/`
}


// Backend WS URLs
export const apiWSBase = () => {
    return backendBaseWS
}

export const apiWSRoom = code => {
    return `${apiWSBase()}meeting/${code}/room/`
}

export const apiWSVideoCall = code => {
    return `${apiWSBase()}meeting/${code}/video_call/`
}

export const apiWSChat = code => {
    return `${apiWSBase()}meeting/${code}/chat/`
}

export const apiWSWhiteboard = code => {
    return `${apiWSBase()}meeting/${code}/whiteboard/`
}

export const apiWSGlobalConversations = () => {
    return `${apiWSBase()}conversations/`
}

export const apiWSConversation = id => {
    return `${apiWSBase()}conversations/${id}/`
}


// OAuth Redirection URLs
export const googleOAuthRedirect = (state = 'google') => {
    const redirect_uri = encodeURIComponent(routeRedirect())
    return (`https://accounts.google.com/o/oauth2/v2/auth?` +
        `response_type=code&` +
        `client_id=681935745791-igm17k4a160g25usvnsoqvepnv71fvok.apps.googleusercontent.com&` +
        `scope=openid%20profile%20email&` +
        `redirect_uri=${redirect_uri}&` +
        `state=${state}`)
}
