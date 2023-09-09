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
  const vlookupRegex = /=VLOOKUP\(([^,]+),?\s*([^,]+)?,?([^)]+)?/i;

  const columnColorMapping: Record<number, { color: string }> = {};

  let highlightedFormula = formula.replace(
    vlookupRegex,
    (match, firstParam, secondParam = '', otherParams = '') => {
      // Highlight the first parameter
      const firstParamIndex = firstParam.charCodeAt(0) - 'A'.charCodeAt(0);
      const firstParamColor = colors[firstParamIndex % 10];
      const firstParamHighlight = `<span style="color: ${firstParamColor}">${firstParam}</span>`;
      columnColorMapping[firstParamIndex] = { color: firstParamColor };

      // Initialize secondParamHighlight with its raw value as default
      let secondParamHighlight = secondParam;

      if (secondParam && !/Sheet/i.test(secondParam)) {
        const rangeMatch = secondParam.match(/([A-Z]+):([A-Z]+)/);
        if (rangeMatch) {
          const secondParamStartIndex =
            rangeMatch[1].charCodeAt(0) - 'A'.charCodeAt(0);
          const secondParamEndIndex =
            rangeMatch[2].charCodeAt(0) - 'A'.charCodeAt(0);
          const secondParamColor = colors[(secondParamStartIndex + 1) % 10];
          secondParamHighlight = `<span style="color: ${secondParamColor}">${secondParam}</span>`;
          for (let i = secondParamStartIndex; i <= secondParamEndIndex; i++) {
            columnColorMapping[i] = { color: secondParamColor };
          }
        } else {
          const secondParamIndex =
            secondParam.charCodeAt(0) - 'A'.charCodeAt(0);
          const secondParamColor = colors[secondParamIndex % 10];
          secondParamHighlight = `<span style="color: ${secondParamColor}">${secondParam}</span>`;
          columnColorMapping[secondParamIndex] = { color: secondParamColor };
        }
      }

      let vlookup = `=VLOOKUP(${firstParamHighlight},`;
      if (secondParamHighlight) {
        vlookup += `${secondParamHighlight},`;
      }
      if (otherParams) {
        vlookup += `${otherParams}`;
      }
      return vlookup;
    }
  );

  if (highlightedFormula === formula) {
    highlightedFormula = formula.replace(columnRegex, (match, colId) => {
      const columnIndex = colId.charCodeAt(0) - 'A'.charCodeAt(0);
      const color = colors[columnIndex % 10];
      columnColorMapping[columnIndex] = { color };
      if (columnIndex >= 0) {
        return `<span style="color: ${color}">${match}</span>`;
      }
      return match;
    });
  }

  return { highlightedFormula, columnColorMapping };
};
