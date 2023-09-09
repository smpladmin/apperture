import { highlightFormula } from './util';

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
