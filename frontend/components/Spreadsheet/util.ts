import { range } from 'lodash';

const generateOtherKeys = (headers: string[]) => {
  return range(headers.length + 1, 27).map((i) =>
    String.fromCharCode(65 + i - 1)
  );
};

export const fillRows = (data: any[], headers: string[]) => {
  const currentLength = data.length;
  const otherKeys = generateOtherKeys(headers);
  const keys = [...headers, ...otherKeys];
  const gen = range(currentLength + 1, 1001).map((index) => {
    const row: any = {};
    keys.forEach((key) => {
      row[key] = '';
    });
    row['index'] = index;
    return row;
  });

  const dataWitKeys = [...data].map((row) => {
    otherKeys.forEach((key) => {
      row[key] = '';
    });
    return row;
  });

  return [...dataWitKeys, ...gen];
};

export const fillHeaders = (headers: string[]) => {
  const gen = generateOtherKeys(headers);
  const updatedHeaders = [...headers, ...gen];
  updatedHeaders.unshift('index');
  return updatedHeaders;
};

class Stack {
  items: string[];
  constructor() {
    this.items = [];
  }

  push(element: string) {
    return this.items.push(element);
  }

  pop() {
    if (this.items.length > 0) {
      return this.items.pop();
    }
  }

  top() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length == 0;
  }

  size() {
    return this.items.length;
  }

  clear() {
    this.items = [];
  }
}

export const isalpha = (c: string) => {
  if ((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z')) {
    return true;
  }
  return false;
};

export const isdigit = (c: string) => {
  if (c >= '0' && c <= '9') {
    return true;
  }
  return false;
};
const isOperator = (c: string) => {
  return !isalpha(c) && !isdigit(c);
};

const getPriority = (C: string) => {
  if (C == '-' || C == '+') return 1;
  else if (C == '*' || C == '/') return 2;
  else if (C == '^') return 3;
  return 0;
};

export const infixToPostfix = (infix: string) => {
  infix = '(' + infix + ')';

  var l = infix.length;
  let char_stack = new Stack();
  var output = '';

  for (var i = 0; i < l; i++) {
    if (isalpha(infix[i]) || isdigit(infix[i])) output += infix[i];
    else if (infix[i] == '(') char_stack.push('(');
    else if (infix[i] == ')') {
      while (char_stack.top() != '(') {
        output += char_stack.top();
        char_stack.pop();
      }

      char_stack.pop();
    } else {
      if (isOperator(char_stack.top())) {
        if (infix[i] == '^') {
          while (getPriority(infix[i]) <= getPriority(char_stack.top())) {
            output += char_stack.top();
            char_stack.pop();
          }
        } else {
          while (getPriority(infix[i]) < getPriority(char_stack.top())) {
            output += char_stack.top();
            char_stack.pop();
          }
        }

        char_stack.push(infix[i]);
      }
    }
  }
  while (!char_stack.isEmpty()) {
    output += char_stack.top();
    char_stack.pop();
  }

  return output;
};

export const infixToPrefix = (infix: string) => {
  var l = infix.length;

  infix = infix.split('').reverse().join('');

  var infixx = infix.split('');
  for (var i = 0; i < l; i++) {
    if (infixx[i] == '(') {
      infixx[i] = ')';
    } else if (infixx[i] == ')') {
      infixx[i] = '(';
    }
  }
  infix = infixx.join('');

  var prefix = infixToPostfix(infix);

  prefix = prefix.split('').reverse().join('');
  return prefix;
};

export const isOperand = (c: string) => {
  if (
    (c.charCodeAt(0) >= 48 && c.charCodeAt(0) <= 57) ||
    (c.charCodeAt(0) >= 65 && c.charCodeAt(0) <= 90)
  )
    return true;
  else return false;
};

const add = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map(
    (item, index) => item + (second_operand[index] || 0)
  );
};
const subtract = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map(
    (item, index) => item - (second_operand[index] || 0)
  );
};

const multiply = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map(
    (item, index) => item * (second_operand[index] || 1)
  );
};

const divide = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map(
    (item, index) => item / (second_operand[index] || 1)
  );
};

export const evaluatePrefix = (
  expression: string,
  lookup_table: { [key: string]: Array<any> }
) => {
  const Stack = [];

  for (let j = expression.length - 1; j >= 0; j--) {
    if (isalpha(expression[j]) || isdigit(expression[j]))
      Stack.push(lookup_table[expression[j]]);
    else {
      const first_operand: any[] = Stack[Stack.length - 1];
      Stack.pop();
      const second_operand: any[] = Stack[Stack.length - 1];
      Stack.pop();

      switch (expression[j]) {
        case '+':
          Stack.push(add(first_operand, second_operand));
          break;
        case '-':
          Stack.push(subtract(first_operand, second_operand));
          break;
        case '*':
          Stack.push(multiply(first_operand, second_operand));
          break;
        case '/':
          Stack.push(divide(first_operand, second_operand));
          break;
      }
    }
  }

  return Stack[Stack.length - 1];
};
