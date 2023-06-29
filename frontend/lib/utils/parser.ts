import peg from 'pegjs';

const MetricGrammar = `
  start
  = expression

expression
  = countif_function/count_function
  
countif_function = fname:countif _ "(" _ params:condition_parameters _ ")" {
      return {formula: fname.toLowerCase(), filters: params};
  }
countif = "countif"i
unique_function = fname:unique _ "("_ property:$(chars+)_")" {
	return {formula:fname.toLowerCase(), property:property}
}
count_function = fname:$count _"(" _ ")" {
      return {formula: fname.toLowerCase()};
  }
count = "count"i 
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
      return {operand: property, operator: op, value: [value]};
  }

in_condition = property:$(property+) _ op:"in" _ "["value:$(chars+)  _ rest: (_ "," _ $(chars+))* _ "]" {
      return {operand: property, operator: op, value: [value].concat(rest.map((param) => param[3]))};
  }

fname
  = "count"i/ "countif"i
unique = "unique"i

property
  = [a-zA-Z_.][a-zA-Z_0-9]*

op
  = "=" / "!=" / "<=" /"<"/">="/">"

chars
  = [a-zA-Z_0-9.][a-zA-Z_0-9]*

_ "whitespace"
  = [ \\t\\n\\r]*
`;

export const Metricparser = peg.generate(MetricGrammar);

const DimensionGrammar = `
  start
  = expression

expression
  = unique_function
  
functions = fname:$(chars+) _ "(" _ params:condition_parameters _ ")" {
      return {function: fname.toLowerCase(), condition_parameters: params};
  }
unique_function = fname:unique _ "("_ property:$(chars+)_")" {
	return {formula:fname.toLowerCase(), property:property}
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
  = "count"i/ "countif"i
unique = "unique"i

property
  = [a-zA-Z_.][a-zA-Z_0-9]*

op
  = "=" / "!=" / "<=" /"<"/">="/">"

chars
  = [a-zA-Z_0-9.][a-zA-Z_0-9]*

_ "whitespace"
  = [ \\t\\n\\r]*
`;

export const DimensionParser = peg.generate(DimensionGrammar);
