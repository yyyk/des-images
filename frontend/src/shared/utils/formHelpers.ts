export const destructDateInputValue = (date: string) => {
  const arr = date.split('-');
  return {
    year: arr[0],
    month: arr[1].padStart(2, '0'),
    day: arr[2].padStart(2, '0'),
  };
};

export const isValidTokenId = (value: string): boolean => {
  let res = value.length > 0;
  if (res) {
    if (value.startsWith('0x')) {
      res = new RegExp(/^[0-9A-F]+$/gi).test(value.substring(2));
    } else {
      res = new RegExp(/^[0-9]+$/gi).test(value);
    }
  }
  return res;
};
