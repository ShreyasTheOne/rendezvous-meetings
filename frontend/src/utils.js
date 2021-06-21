/**
 * From a list of all matching users, pick out the results that haven't already been selected
 * @param  {Array.<User>} all_matching     Queryset returned by the API endpoint with all search results
 * @param  {Array.<User>} already_selected List of elements in store that have already been selected
 * @return {Array.<User>}                  List of matching search results that haven't been already selected
 */
export const get_new_results = (all_matching, already_selected=[]) => {
    let all_i=0, curr_i=0
    const n=all_matching.length, m=already_selected.length

    let new_results = []
    while (all_i < n) {
        if (curr_i === m) {
            new_results.push(all_matching[all_i])
        } else {
            if (all_matching[all_i]['email'] === already_selected[curr_i]['email']) {
                curr_i++;
            } else {
                new_results.push(all_matching[all_i])
            }
        }
        all_i++
    }
    return new_results
}
