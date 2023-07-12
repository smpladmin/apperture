const keywordgenerator = (tokens: string[]) =>
  tokens.reduce((val: string, token: string, index: number) => {
    return val + `"${token}"` + (index != tokens.length - 1 ? ' / ' : '');
  }, '');

export const MetricGrammar = (properties?: string[], values?: string[]) => `
 start = "="ex:expression {return ex}

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
  = head:condition  {
      return [head];
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
 start = "="ex:expression {return ex}

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

export const FormulaExtratorGrammar = `
start = "="ex:expression {return ex}

expression = unique / countif / count / empty

empty = _ {
return {
    FORMULA :'',
    OPERAND:'',
        OPERATOR:'',
        VALUE:[],
  	EOF : ''
    }
}

unique =  complete_unique/unique_without_property 
unique_name = "unique()"i/"unique("i/"unique"i/"uniqu"i/"uniq"i/"uni"i/"un"i/"u"i
unique_without_property= fname:unique_name _
{
	return {
    FORMULA : fname.toLowerCase(),
    OPERAND:'',
        OPERATOR:'',
        VALUE:[]
   ,
  	EOF : ''
    }
}
complete_unique = fname:unique_name _ property:$(value+) _ ")"
{
	return {
    FORMULA : fname.toLowerCase(),
    OPERAND:property,
        OPERATOR:'',
        VALUE:[]
        ,
  	EOF : ')'
    }
}

count_name = "count()"i/"count("i/"count"i/"coun"i/"cou"i/"co"i/"c"i 

count = fname:count_name {
	return {
    FORMULA : fname.toLowerCase().replace(')',''),
    OPERAND:'',
        OPERATOR:'',
        VALUE:[]
        ,
  	EOF : ''
    }
}
countif = count_if_complete / countif_filter / countif_name

countif_name_states ="countif()"i/"countif("i/"countif"i/"counti"i

countif_name = fname:countif_name_states _{
return {
 FORMULA:fname.toLowerCase().replace(')',''),
 OPERAND:'',
    OPERATOR:'',
    VALUE:[],
 EOF:''
} }


countif_filter= fname:countif_name_states _  filters:filter  _ 
{
	return {
    FORMULA:fname.toLowerCase().replace(')',''),
    ...filters,
    EOF:''
}
}

count_if_complete= fname:countif_name_states _ filters:filter _ ")" {
	return {
    FORMULA:fname.toLowerCase().replace(')',''),
    ...filters,
    EOF:')'
    }
}

rest_filters= rest_filters_complete / rest_filters_comma

rest_filters_complete=_ ","_ filter:filter _ {return filter}
rest_filters_comma = _ ',' _ {return {
	OPERAND:'',
    OPERATOR:'',
    VALUE:[]
}}


filter = ( in_condition / arithematic )
arithematic = arithematic_complete / arithematic_operand_operator/ arithematic_operand

arithematic_operand = property:$(value+)_ {
return {
	OPERAND:property,
    OPERATOR: '',
    VALUE: []
    }
}

arithematic_operand_operator = property:$(value+) _ op:operator _ {
return {
	OPERAND:property,
    OPERATOR: op,
    VALUE: []
    }
}


arithematic_complete = property:$(value+) _ op:operator _ value:$(value+) {
return {
	OPERAND:property,
    OPERATOR: op,
    VALUE: [value]
    }
}

in_condition = in_condition_complete / in_condition_till_values / in_condition_operator_operand_sq_bracket_open /in_condition_operator_operand

in_condition_operator_operand_sq_bracket_open = property:$(value+) _ op:"in"i _ "[" {
return {
OPERAND:property,
OPERATOR:"in",
VALUE:[]
}
}

in_condition_operator_operand = property:$(value+) _ op:"in"i _ {
return {
OPERAND:property,
OPERATOR:"in",
VALUE:[]
}
}

in_condition_till_values = property:$(value+) _ op:"in"i _ "[" _ value:$(value+) _ rest:rest_values* _
{return {
	OPERAND:property,
    OPERATOR:"in",
    VALUE: [value].concat(rest.filter(item=>item)),
}}

in_condition_complete = property:$(value+) _ op:"in"i _ "[" _ value:$(value+) _ rest:rest_values* _"]"
{return {
	OPERAND:property,
    OPERATOR:"in",
    VALUE: [value].concat(rest.filter(item=>item)),
}}

rest_values= rest_values_complete/rest_value_comma
rest_values_complete =_ "," _ value:$(value+)  {return value}
rest_value_comma = _ ',' _ {return }

operator = "=" / "!=" / "<=" /"<"/">="/">"
value = [a-zA-Z_0-9.$-][a-zA-Z_0-9]*

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
        VALUE:[]
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
    VALUE:[]
}}


filter = ( in_condition / arithematic )
arithematic = arithematic_complete / arithematic_operand_operator/ arithematic_operand

arithematic_operand = property:$(value+)_ {
return {
	OPERAND:property,
    OPERATOR: '',
    VALUE: []
    }
}

arithematic_operand_operator = property:$(value+) _ op:operator _ {
return {
	OPERAND:property,
    OPERATOR: op,
    VALUE: []
    }
}


arithematic_complete = property:$(value+) _ op:operator _ value:$(value+) {
return {
	OPERAND:property,
    OPERATOR: op,
    VALUE: [value]
    }
}

in_condition = in_condition_complete / in_condition_till_values / in_condition_operator_operand_sq_bracket_open /in_condition_operator_operand

in_condition_operator_operand_sq_bracket_open = property:$(value+) _ op:"in"i _ "[" {
return {
OPERAND:property,
OPERATOR:"in",
VALUE:[]
}
}

in_condition_operator_operand = property:$(value+) _ op:"in"i _ {
return {
OPERAND:property,
OPERATOR:"in",
VALUE:[]
}
}

in_condition_till_values = property:$(value+) _ op:"in"i _ "[" _ value:$(value+) _ rest:rest_values* _
{return {
	OPERAND:property,
    OPERATOR:"in",
    VALUE: [value].concat(rest.filter(item=>item)),
}}

in_condition_complete = property:$(value+) _ op:"in"i _ "[" _ value:$(value+) _ rest:rest_values* _"]"
{return {
	OPERAND:property,
    OPERATOR:"in",
    VALUE: [value].concat(rest.filter(item=>item)),
}}

rest_values= rest_values_complete/rest_value_comma
rest_values_complete =_ "," _ value:$(value+)  {return value}
rest_value_comma = _ ',' _ {return }

operator = "=" / "!=" / "<=" /"<"/">="/">"
value = [a-zA-Z_0-9.$-][a-zA-Z_0-9]*

_ "whitespace"
  = [ \\t\\n\\r]*`;
