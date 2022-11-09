export const getCountOfInputFieldsValue = (steps: any[]) => {
  let count = 0;
  for (const event of steps) {
    if (event['event']) {
      count++;
    }
  }
  return count;
};
