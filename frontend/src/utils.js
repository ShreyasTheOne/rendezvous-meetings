import axios from 'axios'
import {apiIAmTheMeetingHostUrl} from "./urls"

/**
 * If the length of the string exceeds the limit, it truncates it to the limit and adds three dots at the end
 * @param  {string} text    The string to be fitted
 * @param  {number} limit   The maximum length allowed
 * @return {string}         The fitted string
 */
export const fitText = (text, limit = 40) => {
    if (text.length > limit) {
        return `${text.slice(0, limit)}...`
    } else {
        return text
    }
}

/**
 * Makes API call to check if user is the host
 * of the meeting with the given code
 * @param code          Meeting code
 * @returns {boolean}   True if user if the meeting host
 */
export const iAmTheMeetingHost = code => {
    console.log(code)
    return axios({
        url: apiIAmTheMeetingHostUrl(),
        method: 'post',
        data: {code}
    }).then(res => {
        return res.data['status']
    })
}

/**
 * Based on the number of users in the meeting, this function returns the optimal values
 * for the number of rows and columns to properly display everyone
 * @param  {number} n   The number of users in the meeting
 * @return {Array<number>} An array containing the rows and columns required
 */
export const getVideoGridDimensions = n => {
    if (n === 1) return [1, 2]

    let rows=1, columns=1
    while (true) {
        let low = rows*columns, high
        if (rows === columns) {
            high = rows*(columns+1)
            if (low === n) return [rows, columns]

            if (low < n && n <= high) {
                return [rows, columns+1]
            }
            columns++
        } else {
            high = (rows + 1) * columns
            if (low === n) return [rows, columns]
            if (low < n && n <= high) {
                return [rows+1, columns]
            }
            rows++
        }
    }
}

/**
 * From a list of all matching users, pick out the results that haven't already been selected
 * @param  {Array.<User>} all_matching     Queryset returned by the API endpoint with all search results
 * @param  {Array.<User>} already_selected List of elements in store that have already been selected
 * @return {Array.<User>}                  List of matching search results that haven't been already selected
 */

// CURRENTLY NOT BEING USED
export const get_new_results = (all_matching, already_selected=[]) => {
    already_selected.sort()

    let all_i=0, curr_i=0
    const n=all_matching.length, m=already_selected.length

    let new_results = []
    while (all_i < n) {
        const new_entry = all_matching[all_i]
        if (curr_i === m) {
            new_results.push(new_entry)
        } else {
            if (new_entry['key'] === already_selected[curr_i]) {
                curr_i++;
            } else {
                new_results.push(new_entry)
            }
        }
        all_i++
    }
    return new_results
}
