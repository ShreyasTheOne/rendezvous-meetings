import { combineReducers } from 'redux'
import userInformation from "./user"
import meetingInformation from "./meeting"
import videoCallInformation from "./video_call"

const reducers = combineReducers({
    userInformation,
    meetingInformation,
    videoCallInformation
})

export default reducers
