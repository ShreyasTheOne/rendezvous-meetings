import { combineReducers } from 'redux'
import userInformation from "./user"
import meetingInformation from "./meeting"

const reducers = combineReducers({
    userInformation,
    meetingInformation
})

export default reducers
