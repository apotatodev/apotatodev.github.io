/**
 * @param {Map<string, Image>} map 
 * @param {number} startIndex
 * @returns {Image[]}
 */
const imageMapToArray = (map, startIndex = 0) => Array.from(new Array(map.size()), (_, i) => map.get(`${i + startIndex}`));

/**
 * @param {T[]} oneDGrid 
 * @param {number} columns 
 * @param {number} rows 
 * @param {<T>(row: number, column: number, item: T) => T} callBackfn
 * @returns {T[][]}
 */
const oneDGridTo2DGrid = (oneDGrid, rows, columns, callBackfn = item => item) =>
    Array.from(new Array(rows), (_, row) =>
        Array.from(new Array(columns), (_, column) =>
            callBackfn(oneDGrid[row * columns + column], row, column)
));


export {
    imageMapToArray,
    oneDGridTo2DGrid
};