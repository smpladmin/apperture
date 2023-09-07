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
  const columnRegex = /([A-Z]+)/g;
  const columnColorMapping: Record<string, { color: string }> = {};

  const highlightedFormula = formula.replace(columnRegex, (match, colId) => {
    const columnIndex = colId.charCodeAt(0) - 'A'.charCodeAt(0);
    const color = colors[columnIndex % 10];
    columnColorMapping[columnIndex] = { color };
    if (columnIndex >= 0) {
      return `<span style="color: ${color}">${match}</span>`;
    }
    return match;
  });
  return { highlightedFormula, columnColorMapping };
};
