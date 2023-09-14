import {
  highlightFormula,
  findCommaIndices,
  findActiveFormulaPartIndex,
  extractFormulaName,
  isValidSheetFormula,
} from './util';

describe('util', () => {
  describe('highlighted formula', () => {
    it('should accept a sting and return a highlighted string', () => {
      const formulaString = '=A+B';
      const { highlightedFormula, columnColorMapping } =
        highlightFormula(formulaString);
      expect(highlightedFormula).toEqual(
        `=<span style="color: #F7981D">A</span>+<span style="color: #7E3794">B</span>`
      );
      expect(columnColorMapping).toEqual({
        0: { color: '#F7981D' },
        1: { color: '#7E3794' },
      });
    });

    it('should accept a sting and return string as it is if it doesn not start with `=`', () => {
      const formulaString = 'Anish';
      const { highlightedFormula, columnColorMapping } =
        highlightFormula(formulaString);
      expect(highlightedFormula).toEqual(formulaString);
      expect(columnColorMapping).toEqual({});
    });

    it('should accept a sting and return a highlighted string', () => {
      const formulaString = '=VLOOKUP(A, Sheet1!A:B, 2, 0)';
      const { highlightedFormula, columnColorMapping } =
        highlightFormula(formulaString);
      expect(highlightedFormula).toEqual(
        '=VLOOKUP(<span style="color: #F7981D">A</span>,Sheet1!A:B, 2, 0)'
      );
      expect(columnColorMapping).toEqual({
        0: { color: '#F7981D' },
      });
    });

    it('should accept a sting and return a highlighted string', () => {
      const formulaString = '=VLOOKUP(A, B:C, 2, 0)';
      const { highlightedFormula, columnColorMapping } =
        highlightFormula(formulaString);
      expect(highlightedFormula).toEqual(
        `=VLOOKUP(<span style=\"color: #F7981D\">A</span>,<span style=\"color: #11A9CC\">B:C</span>, 2, 0)`
      );
      expect(columnColorMapping).toEqual({
        0: { color: '#F7981D' },
        1: { color: '#11A9CC' },
        2: { color: '#11A9CC' },
      });
    });
  });

  describe('findCommaIndices', () => {
    test('should return an empty array when there are no commas', () => {
      const inputString = 'This is a test string';
      const result = findCommaIndices(inputString);
      expect(result).toEqual([]);
    });

    test('should return the indices of commas in the input string', () => {
      const inputString = 'A,B,C,D,E,F';
      const result = findCommaIndices(inputString);
      expect(result).toEqual([1, 3, 5, 7, 9]);
    });

    test('should handle multiple consecutive commas correctly', () => {
      const inputString = '1,,2,,,3';
      const result = findCommaIndices(inputString);
      expect(result).toEqual([1, 2, 4, 5, 6]);
    });
  });

  describe('findActiveFormulaPartIndex', () => {
    test('should return 0 when caretPosition is before the first comma', () => {
      const caretPosition = 2;
      const commaIndices = [5, 10, 15];
      const result = findActiveFormulaPartIndex(caretPosition, commaIndices);
      expect(result).toBe(0);
    });

    test('should return the correct index when caretPosition is between commas', () => {
      const caretPosition = 12;
      const commaIndices = [5, 10, 15];
      const result = findActiveFormulaPartIndex(caretPosition, commaIndices);
      expect(result).toBe(2);
    });

    test('should return the last index when caretPosition is after the last comma', () => {
      const caretPosition = 20;
      const commaIndices = [5, 10, 15];
      const result = findActiveFormulaPartIndex(caretPosition, commaIndices);
      expect(result).toBe(3);
    });

    test('should return 0 for an empty commaIndices array', () => {
      const caretPosition = 5;
      const commaIndices: number[] = [];
      const result = findActiveFormulaPartIndex(caretPosition, commaIndices);
      expect(result).toBe(0);
    });

    test('should return 0 when caretPosition is 0 and there is at least one comma', () => {
      const caretPosition = 0;
      const commaIndices = [5, 10, 15];
      const result = findActiveFormulaPartIndex(caretPosition, commaIndices);
      expect(result).toBe(0);
    });
  });

  describe('extractFormulaName', () => {
    test('should extract formula name from a valid formula string', () => {
      const formulaString = '=SUM(';
      const result = extractFormulaName(formulaString);
      expect(result).toBe('SUM');
    });

    test('should handle formula name with underscores', () => {
      const formulaString = '=VLOOKUP(';
      const result = extractFormulaName(formulaString);
      expect(result).toBe('VLOOKUP');
    });

    test('should handle formula name which does not start with `=`', () => {
      const formulaString = 'VLOOKUP';
      const result = extractFormulaName(formulaString);
      expect(result).toBe('');
    });
  });

  describe('isValidSheetFormula', () => {
    const formulas = ['SUM', 'VLOOKUP', 'MAX', 'MIN'];

    test('should return true for a valid formula', () => {
      const currentFormula = '=SUM(';
      const result = isValidSheetFormula(currentFormula, formulas);
      expect(result).toBe(true);
    });

    test('should return true for a valid formula with underscores', () => {
      const currentFormula = '=VLOOKUP(';
      const result = isValidSheetFormula(currentFormula, formulas);
      expect(result).toBe(true);
    });

    test('should return false for an invalid formula', () => {
      const currentFormula = '=INVALID(';
      const result = isValidSheetFormula(currentFormula, formulas);
      expect(result).toBe(false);
    });

    test('should return false for an empty formula', () => {
      const currentFormula = '';
      const result = isValidSheetFormula(currentFormula, formulas);
      expect(result).toBe(false);
    });

    test('should return false for a formula with no name', () => {
      const currentFormula = '=(';
      const result = isValidSheetFormula(currentFormula, formulas);
      expect(result).toBe(false);
    });
  });
});
