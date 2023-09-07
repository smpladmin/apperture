export const colors = [
  '#F7981D',
  '#7E3794',
  '#11A9CC',
  '#A61D4C',
  '#4285F4',
  '#F4B400',
  '#65B045',
  '#795548',
  '#3F5CA9',
  '#F1CA3A',
];

export const highlightFormula = (formula: string) => {
  console.log('formula recieved', formula);
  const columnRegex = /([A-Z]+)/g;
  return formula.replace(columnRegex, (match, colId) => {
    const columnIndex = colId.charCodeAt(0) - 'A'.charCodeAt(0);
    if (columnIndex >= 0 && columnIndex < colors.length) {
      return `<span style="color: ${colors[columnIndex]}">${match}</span>`;
    }
    return match;
  });
};
