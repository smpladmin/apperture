import { highlightFormula } from './util';

describe('highlighted formula', () => {
  it('should accept a sting and return a highlighted string', () => {
    const formulaString = '=A+B';
    // =, A, +, B
    // =<span style={{color: 'orange'}}>A</span style{{color: 'blue'}}>+<span>B</span>
    const res = highlightFormula(formulaString);
    expect(res).toEqual(
      `=<span style={{color: #FF5733}}>A</span>+<span style={{color: #33FF57}}>B</span>`
    );
  });
});
