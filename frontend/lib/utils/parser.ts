import peg from 'pegjs';

console.log({ peg });
const grammar = `
  start
  = expression

expression
  = functions/if_statement
  
functions = fname:$(chars+) _ "(" _ params:condition_parameters _ ")" {
      return {function: fname.toLowerCase(), condition_parameters: params};
  }

if_statement = fname:("if") _ "(" _ params:condition _ ","_ then:$(chars+)_ "," other:$(chars+)_ ")" {
      return {function: fname, condition_parameters: params};
  }

condition_parameters
  = head:condition tail:(_ "," _ condition)* {
      return [head].concat(tail.map((param) => param[3]));
  }

condition
  =  arithematic_condition / in_condition

arithematic_condition = property:$(property+) _ op:$(op) _ value:$(chars+) {
      return {property: property, operator: op, value: [value]};
  }

in_condition = property:$(property+) _ op:"in" _ "["value:$(chars+)  _ rest: (_ "," _ $(chars+))* _ "]" {
      return {property: property, operator: op, value: [value].concat(rest.map((param) => param[3]))};
  }

fname
  = "count"i / "unique"i / "countif"i

property
  = [a-zA-Z_.][a-zA-Z_0-9]*

op
  = "=" / "!=" / "<=" /"<"/">="/">"

chars
  = [a-zA-Z_0-9.][a-zA-Z_0-9]*

_ "whitespace"
  = [ \\t\\n\\r]*
`;

const parser = peg.generate(grammar);
export default parser;
