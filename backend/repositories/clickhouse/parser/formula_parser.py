import logging
from typing import List

from pypika import Field


class PostFixConverter:

    # Constructor to initialize the class variables
    def __init__(self, capacity):
        self.top = -1
        self.capacity = capacity
        # This array is used a stack
        self.array = []
        # Precedence setting
        self.output = []
        self.precedence = {"+": 1, "-": 1, "*": 2, "/": 2, "^": 3}

    # check if the stack is empty
    def isEmpty(self):
        return True if self.top == -1 else False

    # Return the value of the top of the stack
    def peek(self):
        return self.array[-1]

    # Pop the element from the stack
    def pop(self):
        if not self.isEmpty():
            self.top -= 1
            return self.array.pop()
        else:
            return "$"

    # Push the element to the stack
    def push(self, op):
        self.top += 1
        self.array.append(op)

    # A utility function to check is the given character
    # is operand
    def isOperand(self, ch):
        return ch.isalnum() or ch == "."

    # Check if the precedence of operator is strictly
    # less than top of stack or not
    def notGreater(self, i):
        try:
            operand1 = self.precedence[i]
            operand2 = self.precedence[self.peek()]
            return True if operand1 <= operand2 else False
        except KeyError:
            return False

    def infixToPostfix(self, exp):

        # Iterate over the expression for conversion
        for i in exp:
            # If the character is an operand,
            # add it to output
            if self.isOperand(i):
                self.output.append(i)

            # If the character is an '(', push it to stack
            elif i == "(":
                self.push(i)

            # If the scanned character is an ')', pop and
            # output from the stack until and '(' is found
            elif i == ")":
                while (not self.isEmpty()) and self.peek() != "(":
                    operand1 = self.pop()
                    self.output.append(operand1)
                if not self.isEmpty() and self.peek() != "(":
                    return -1
                else:
                    self.pop()

            # An operator is encountered
            else:
                while not self.isEmpty() and self.notGreater(i):
                    self.output.append(self.pop())
                self.push(i)

        # pop all the operator from the stack
        while not self.isEmpty():
            self.output.append(self.pop())

        return "".join(self.output)


class FormulaParser:
    def __init__(self):
        self.operators = set(["*", "+", "/", "-"])

    def validate_formula(self, expression: str, variable_list: List[str]) -> bool:
        stack = []
        variables = set(variable_list)
        is_variable_present = False
        try:
            for i, char in enumerate(expression):
                if char in variables:
                    is_variable_present = True
                    if i > 0 and (
                        expression[i - 1] in variables or expression[i - 1].isdigit()
                    ):
                        return False
                elif char.isdigit():
                    if i > 0 and (expression[i - 1] in variables):
                        return False
                elif char in self.operators:
                    if (
                        i == 0
                        or expression[i - 1] in self.operators
                        or expression[i - 1] == "("
                    ):
                        return False
                elif char == ".":
                    if (
                        i == 0
                        or not expression[i - 1].isdigit()
                        or i + 1 >= len(expression)
                        or not expression[i + 1].isdigit()
                    ):
                        return False
                elif char == "(":
                    if i > 0 and (
                        expression[i - 1].isdigit()
                        or expression[i - 1] in variables
                        or expression[i - 1] == ")"
                    ):
                        return False
                    stack.append("(")
                elif char == ")":
                    if not stack or stack[-1] != "(":
                        return False
                    stack.pop()
                else:
                    return False
            if stack:
                return False
            return is_variable_present
        except Exception as e:
            return False

    def operate(self, character, operand1, operand2, denominators, expression):
        if character == "+":
            expression = operand1 + operand2
        elif character == "-":
            expression = operand1 - operand2
        elif character == "/":
            denominators.append(operand2)
            expression = operand1 / operand2
        elif character == "*":
            expression = operand1 * operand2
        return expression, denominators

    def parseDigits(self, postfix_expression, start_index, character):
        isDecimal = False
        end_index = start_index + 1
        candidate_character = postfix_expression[end_index]
        while (
            candidate_character.isdigit() or candidate_character == "."
        ) and end_index < len(postfix_expression):
            if candidate_character == ".":
                isDecimal = True
            character += candidate_character
            end_index += 1
            candidate_character = postfix_expression[end_index]
        return end_index, float(character) if isDecimal else int(character)

    def parse(self, function: str, wrapper_function):
        if wrapper_function == None:
            logging.error("Wrapper function not defined")
            # raise ValueError("Wrapper function not defined")
            return None, []
        try:
            # Parses only variables and single digit numbers to expressions for now
            obj = PostFixConverter(len(function))
            # Changed to postfix notation to maintain precedence
            postfix_expression = obj.infixToPostfix(function)
            expression = None
            stack = []
            denominators = []
            start_index = 0
            while start_index < len(postfix_expression):
                character = postfix_expression[start_index].upper()
                if character in self.operators:
                    operand2 = stack.pop()
                    operand1 = stack.pop()
                    expression, denominators = self.operate(
                        character=character,
                        operand1=operand1,
                        operand2=operand2,
                        denominators=denominators,
                        expression=expression,
                    )
                    stack.append(expression)
                    start_index += 1
                elif character.isalpha():
                    stack.append(wrapper_function(Field(character)))
                    start_index += 1
                elif character.isnumeric():
                    start_index, number = self.parseDigits(
                        postfix_expression=postfix_expression,
                        start_index=start_index,
                        character=character,
                    )
                    stack.append(number)
        except:
            # Backend uses 100% memory on raising this error
            logging.error(f"Invalid formula expression:\t{function}")
            return None, []
            # raise ValueError("Invalid formula expression")
        if len(stack) == 1:
            return stack[0], denominators
        else:
            logging.error(f"Invalid formula expression:\t{function}")
            return None, []

            # raise ValueError("Invalid formula expression:\t{function}")
