import { highlightFormula } from './util';

describe('highlighted formula', () => {
  it('should accept a sting and return a highlighted string', () => {
    const formulaString = '=A+B';
    const res = highlightFormula(formulaString);
    expect(res).toEqual(
      `=<span style="color: #F7981D">A</span>+<span style="color: #7E3794">B</span>`
    );
  });
});
