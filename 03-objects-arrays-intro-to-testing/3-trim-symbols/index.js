/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
  if (!Number.isInteger(size)) {
    return string;
  }

  let counter = 0;

  return string
    .split('')
    .reduce((acc, element, index) => {
      counter = element === string[index - 1] ? counter + 1 : 1;

      if (counter <= size) {
        acc.push(element);
      }

      return acc;
    }, [])
    .join('');
}
