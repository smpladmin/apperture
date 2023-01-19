import logging
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
        return ch.isalnum()

    # Check if the precedence of operator is strictly
    # less than top of stack or not
    def notGreater(self, i):
        try:
            a = self.precedence[i]
            b = self.precedence[self.peek()]
            return True if a <= b else False
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
                    a = self.pop()
                    self.output.append(a)
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
    def parse(self, function: str, wrapper_function):
        if wrapper_function == None:
            raise ValueError("Wrapper function not defined")
        try:
            # Parses only variables and single digit numbers to expressions for now
            obj = PostFixConverter(len(function))
            # Changed to postfix notation to maintain precedence
            postfix_expression = obj.infixToPostfix(function)
            expression = None
            stack = []
            denominators = []
            for c in postfix_expression:
                if c == "+" or c == "-" or c == "/" or c == "*":
                    b = stack.pop()
                    a = stack.pop()
                    if c == "+":
                        expression = a + b
                    elif c == "-":
                        expression = a - b
                    elif c == "/":
                        denominators.append(b)
                        expression = a / b
                    elif c == "*":
                        expression = a * b
                    stack.append(expression)
                elif c >= "A" and c <= "Z":
                    stack.append(wrapper_function(Field(c)))
                elif c >= "1" and c <= "9":
                    stack.append(int(c))
        except:
            logging.error(f"Invalid formula expression:\t{function}")
            raise ValueError("Invalid formula expression")
        return (
            (stack[0], denominators)
            if len(stack) == 1
            else (wrapper_function(Field("A")), denominators)
        )
