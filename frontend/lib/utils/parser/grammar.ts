const keywordgenerator = (tokens: string[]) =>
  tokens.reduce((val: string, token: string, index: number) => {
    return val + `"${token}"` + (index != tokens.length - 1 ? ' / ' : '');
  }, '');

export const MetricGrammar = (properties?: string[], values?: string[]) => `
  start
  = expression

expression
  = countif_function/count_function
  
countif_function = fname:countif _ params:condition_parameters _ ")" {
      return {formula: fname.slice(0,-1).toLowerCase(), filters: params};
  }
countif = "countif("i

count_function = fname:$count _ ")" {
      return {formula: fname.slice(0,-1).toLowerCase().replace('(','')};
  }
count = "count("i 

condition_parameters
  = head:condition tail:(_ "," _ condition)* {
      return [head].concat(tail.map((param) => param[3]));
  }

condition
  =  arithematic_condition / in_condition

arithematic_condition = property:$(${
  properties ? 'property' : 'property+'
}) _ op:$(op) _ value:$(${values?.length ? 'value' : 'value+'}) {
      return {operand: property, operator: op, value: [value]};
  }

in_condition = property:$(${
  properties ? 'property' : '$(property+)'
}) _ op:"in" _ "["value:$(${
  values?.length ? 'value' : 'value+'
})  _ rest: (_ "," _ $(${values?.length ? 'value' : 'value+'}))* _ "]" {
      return {operand: property, operator: op, value: [value].concat(rest.map((param) => param[3]))};
  }

fname
  = "count"i/ "countif"i
unique = "unique"i


if_statement = fname:("if") _ "(" _ params:condition _ ","_ then:$(chars+)_ "," other:$(chars+)_ ")" {
      return {function: fname, condition_parameters: params};
  }


value
  = ${values?.length ? keywordgenerator(values) : '[a-zA-Z_.$][a-zA-Z_0-9$]*'}

property
  = ${properties ? keywordgenerator(properties) : '[a-zA-Z_.$][a-zA-Z_0-9$]*'}

op
  = "=" / "!=" / "<=" /"<"/">="/">"

chars
  = [a-zA-Z_0-9.][a-zA-Z_0-9]*

_ "whitespace"
  = [ \\t\\n\\r]*
`;

export const DimensionGrammar = (properties?: string[]) => `
  start
  = expression

expression
  = unique_function
  
unique_function = fname:unique _ property:${
  properties ? 'property' : '$(property+)'
} _")" {
	return {formula:fname.toLowerCase().replace('(',''), property:property}
}

unique = "unique("i

property
  = ${properties ? keywordgenerator(properties) : '[a-zA-Z_.][a-zA-Z_0-9$]*'}

_ "whitespace"
  = [ \\t\\n\\r]*
`;

export const FormulaExtratorGrammar = `Expression = function_operand_operator_values_end/ function_operand_in_operator_values_end/ function_operand_in_operator_values / function_operand_operator_values/ 
          function_operand_operator/function_operand_in_operator/function_operand_in_operator_values / function_operand / fname / empty_input

empty_input = _ { return {
  FORMULA : '',
  OPERAND : '',
  OPERATOR :'',
  VALUE :[],
  EOF : ''
}
}
 
fname = fname:("unique("i /"count("i / "countif("i) { 

return {
  FORMULA : fname,
  OPERAND : '',
  OPERATOR :'',
  VALUE :[],
  EOF : ''
}
}
 
function_without_condition =fname _ ")"
{
return {
  FORMULA : fname,
  OPERAND : '',
  OPERATOR :'',
  VALUE :[],
  EOF : '',
}
}

function_operand_end = function_operand:function_operand _ ")"  { 
return {
  FORMULA : function_operand,
  OPERAND : function_operand,
  OPERATOR :'',
  VALUE :[],
  EOF : ')'
}
}
 
function_operand = fname:fname _ property:$(value+) _ {
return {
  ...fname,
  OPERAND : property,
} 
}


function_operand_operator = function_operand:function_operand _ operator:operator _{
return {
  ...function_operand,
  OPERATOR :operator,
}
}

function_operand_in_operator = function_operand:function_operand _ operator:"in"i _{
return {
  ...function_operand,
  OPERATOR :operator,
}
}

operator = "=" / "!=" / "<=" /"<"/">="/">"
function_operand_operator_values = function_operand_operator:function_operand_operator _ values:$(value+) _{
return {
  ...function_operand_operator,
  VALUE :[values],
}
}

function_operand_in_operator_values =
function_operand_in_operator:function_operand_in_operator _ "[" _ values:$(value+) _ rest:(_ "," $(value+) )*"]" _{
return {
  ...function_operand_in_operator,
  VALUE :[values].concat(rest.map(item=>item[2]))
}
}

function_operand_in_operator_values_end =
function_operand_in_operator_values:function_operand_in_operator_values _ ")" {
return {
  ...function_operand_in_operator_values,
  EOF : ')'
}
}

function_operand_operator_values_end = function_operand_operator_values:function_operand_operator_values _ ")" {
return {
  ...function_operand_operator_values,
  EOF : ')'
}
}

value = [a-zA-Z_0-9.][a-zA-Z_0-9]*

_ "whitespace"
  = [ \\t\\n\\r]*
`;

export const FormulaExtratorGrammarV2 = `
start = expression

expression = unique / count / countif 

unique =  complete_unique/unique_without_property 
unique_without_property= fname:"unique("i _
{
	return {
    FORMULA : "unique(",
  	FILTERS:[],
  	EOF : ''
    }
}
complete_unique = fname:"unique("i _ property:$(value+) _ ")"
{
	return {
    FORMULA : "unique(",
  	FILTERS:[
    {
    	OPERAND:property,
        OPERATOR:'',
        VALUES:[]
    }
    ],
  	EOF : ')'
    }
}

count = fname:"count()"i {
	return {
    FORMULA : "count(",
  	FILTERS:[],
  	EOF : ')'
    }
}

countif = count_if_complete / countif_filter / countif_name

countif_name = fname:"countif("_{
return {
 FORMULA:"countif(",
 FILTERS:[],
 EOF:''
} }


countif_filter= fname:"countif("_  filters:filter _ rest_filters:rest_filters* _ 
{
	return {
    FORMULA:"countif(",
    FILTERS:[filters].concat(rest_filters),
    EOF:''
}
}

count_if_complete= fname:"countif("_ filters:filter _ rest_filters:rest_filters* _ ")" {
	return {
    FORMULA:"countif(",
    FILTERS:[filters].concat(rest_filters),
    EOF:')'
    }
}

rest_filters= rest_filters_complete / rest_filters_comma

rest_filters_complete=_ ","_ filter:filter _ {return filter}
rest_filters_comma = _ ',' _ {return {
	FORMULA:'',
    OPERATOR:'',
    VALUES:[]
}}


filter = ( in_condition / arithematic )
arithematic = arithematic_complete / arithematic_operand_operator/ arithematic_operand

arithematic_operand = property:$(value+)_ {
return {
	OPERAND:property,
    OPERATOR: '',
    VALUES: []
    }
}

arithematic_operand_operator = property:$(value+) _ op:operator _ {
return {
	OPERAND:property,
    OPERATOR: op,
    VALUES: []
    }
}


arithematic_complete = property:$(value+) _ op:operator _ value:$(value+) {
return {
	OPERAND:property,
    OPERATOR: op,
    VALUES: [value]
    }
}

in_condition = in_condition_complete / in_condition_till_values / in_condition_operator_operand_sq_bracket_open /in_condition_operator_operand

in_condition_operator_operand_sq_bracket_open = property:$(value+) _ op:"in"i _ "[" {
return {
OPERAND:property,
OPERATOR:"in",
VALUES:[]
}
}

in_condition_operator_operand = property:$(value+) _ op:"in"i _ {
return {
OPERAND:property,
OPERATOR:"in",
VALUES:[]
}
}

in_condition_till_values = property:$(value+) _ op:"in"i _ "[" _ value:$(value+) _ rest:rest_values* _
{return {
	OPERAND:property,
    OPERATOR:"in",
    VALUES: [value].concat(rest.filter(item=>item)),
}}

in_condition_complete = property:$(value+) _ op:"in"i _ "[" _ value:$(value+) _ rest:rest_values* _"]"
{return {
	OPERAND:property,
    OPERATOR:"in",
    VALUES: [value].concat(rest.filter(item=>item)),
}}

rest_values= rest_values_complete/rest_value_comma
rest_values_complete =_ "," _ value:$(value+)  {return value}
rest_value_comma = _ ',' _ {return }

operator = "=" / "!=" / "<=" /"<"/">="/">"
value = [a-zA-Z_0-9.][a-zA-Z_0-9]*

_ "whitespace"
  = [ \t\n\r]*`;
