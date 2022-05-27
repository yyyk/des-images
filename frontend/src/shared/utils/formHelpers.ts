export const destructDateInputValue = (date: string) => {
  const arr = date.split('-');
  return {
    year: arr[0],
    month: arr[1].padStart(2, '0'),
    day: arr[2].padStart(2, '0'),
  };
};
