
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
