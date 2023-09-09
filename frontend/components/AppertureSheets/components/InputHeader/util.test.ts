import { highlightFormula } from './util';

describe('highlighted formula', () => {
  it.only('should accept a sting and return a highlighted string', () => {
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
    expect(highlightedFormula).toEqual(``);
    expect(columnColorMapping).toEqual({
      A: { color: '#F7981D' },
      B: { color: '#7E3794' },
    });
  });

  it('should accept a sting and return a highlighted string', () => {
    const formulaString = '=VLOOKUP(A, A:B, 2, 0)';
    const { highlightedFormula, columnColorMapping } =
      highlightFormula(formulaString);
    expect(highlightedFormula).toEqual(
      `=VLOOKUP(<span style=\"color: #F7981D\">A</span>, <span style=\"color: #F7981D\">A</span>:<span style=\"color: #7E3794\">B</span>, 2, 0)`
    );
    expect(columnColorMapping).toEqual({
      0: { color: '#F7981D' },
      1: { color: '#7E3794' },
    });
  });
});
