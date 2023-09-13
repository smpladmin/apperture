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
  const columnColorMapping: Record<number, { color: string }> = {};
  if (!formula.startsWith('=')) {
    return { highlightedFormula: formula, columnColorMapping };
  }
  const columnRegex = /([A-Z]+)/g;
  const vlookupRegex = /=VLOOKUP\(([^,]+),?\s*([^,]+)?,?([^)]+)?/i;

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

export type SheetFormula = {
  name: string;
  value: string;
  parts: string[];
  suggestion: string;
};

export const SHEET_FORMULAS: SheetFormula[] = [
  {
    name: 'VLOOKUP',
    value: '=VLOOKUP(',
    parts: ['search_column', 'range', 'index', '[is_sorted]'],
    suggestion: 'VLOOKUP(search_column, range, index, [is_sorted]',
  },
];

export const VALID_SHEET_FORMULA_NAMES = ['VLOOKUP'];

export const findCommaIndices = (inputString: string): number[] => {
  return Array.from(inputString).reduce(
    (indices: number[], char: string, index: number) => {
      if (char === ',') {
        indices.push(index);
      }
      return indices;
    },
    []
  );
};

export const findActiveFormulaPartIndex = (
  caretPosition: number,
  commaIndices: number[]
): number => {
  if (caretPosition < commaIndices[0]) {
    return 0;
  }

  const lastIndex = commaIndices.length - 1;

  // Check if caretPosition is greater than the last/largest comma index
  if (caretPosition > commaIndices[lastIndex]) {
    return commaIndices.length;
  }

  for (let i = 0; i < commaIndices.length; i++) {
    if (commaIndices[i] >= caretPosition) {
      return i;
    }
  }

  return 0;
};

export const extractFormulaName = (formulaName: string): string => {
  const formulaTextRegex = /=(\w+)\(/; // check strings starts with '=' and ends wih '('
  const match = formulaName.match(formulaTextRegex); // Extract text between '=' and '('

  if (match && match[1]) return match[1];
  return '';
};

export const isValidSheetFormula = (
  currentFormula: string,
  formulas: string[]
): boolean => {
  const formulaName = extractFormulaName(currentFormula);

  const isValidFunction = formulas.includes(formulaName);

  if (isValidFunction) {
    return true;
  }

  return false;
};
