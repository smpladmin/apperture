import peg from 'pegjs';

const keywordgenerator = (tokens: string[]) =>
  tokens.reduce((val: string, token: string, index: number) => {
    return val + `"${token}"i` + (index != tokens.length - 1 ? ' / ' : '');
  }, '');

const MetricGrammar = (properties: string[]) => `
  start
  = expression

expression
  = countif_function/count_function
  
countif_function = fname:countif _ params:condition_parameters _ ")" {
      return {formula: fname.toLowerCase(), filters: params};
  }
countif = "countif("i
unique_function = fname:unique _ property:$(chars+)_")" {
	return {formula:fname.toLowerCase().replace('(',''), property:property}
}
count_function = fname:$count _ ")" {
      return {formula: fname.toLowerCase().replace('(','')};
  }
count = "count("i 
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
  = ${
    properties.length ? keywordgenerator(properties) : '[a-zA-Z_.][a-zA-Z_0-9]*'
  }

op
  = "=" / "!=" / "<=" /"<"/">="/">"

chars
  = [a-zA-Z_0-9.][a-zA-Z_0-9]*

_ "whitespace"
  = [ \\t\\n\\r]*
`;

export const Metricparser = (properties: string[]) =>
  peg.generate(MetricGrammar(properties || ['event_name', 'user_id']));

const DimensionGrammar = (properties: string[]) => `
  start
  = expression

expression
  = unique_function
  
functions = fname:$(chars+) _ "(" _ params:condition_parameters _ ")" {
      return {function: fname.toLowerCase().replace('(',''), condition_parameters: params};
  }
unique_function = fname:unique _ property:property _")" {
	return {formula:fname.toLowerCase().replace('(',''), property:property}
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
unique = "unique("i

property
  = ${
    properties.length ? keywordgenerator(properties) : '[a-zA-Z_.][a-zA-Z_0-9]*'
  }

op
  = "=" / "!=" / "<=" /"<"/">="/">"

chars
  = [a-zA-Z_0-9.][a-zA-Z_0-9]*

_ "whitespace"
  = [ \\t\\n\\r]*
`;

console.log(keywordgenerator(['event_name', 'user_id']));

export const DimensionParser = (properties: string[]) =>
  peg.generate(DimensionGrammar(properties));
