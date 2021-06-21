import config from './config.json'
const isDev = config.isDev

// Frontend Routes

export const routeBase = () => {
    return isDev ? `http://localhost:51000/` : ''
}

export const routeHome = () => {
    return `${routeBase()}`
}

export const routeOrganisations = () => {
    return `${routeBase()}organisations/`
}

export const routeCollaborations = () => {
    return `${routeBase()}collaborations/`
}

export const routeMeeting = code => {
    return `${routeBase()}meeting/${code}`
}

// Backend URLs

const backendUrl = () => {
    return isDev ? `http://localhost:50000/` : ''
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

export const apiUserSearchUrl = query => {
    return `${apiBase()}search_users/?search=${query}`
}

// OAuth Redirection URLs

export const googleOAuthRedirect = (state = 'google') => {
    return (`https://accounts.google.com/o/oauth2/v2/auth?` +
    `response_type=code&` +
    `client_id=681935745791-igm17k4a160g25usvnsoqvepnv71fvok.apps.googleusercontent.com&` +
    `scope=openid%20profile%20email&` +
    `redirect_uri=http%3A//localhost:51000/redirect&` +
    `state=${state}`)
}
