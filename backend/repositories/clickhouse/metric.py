
import logging
from repositories.clickhouse.segments import Segments
from typing import List
from domain.metrics.models import SegmentsAndEventsType, SegmentsAndEvents,SegmentsAndEventsAggregationsFunctions,SegmentsAndEventsFilterOperator
from pypika import ClickHouseQuery, Parameter, Field, Criterion, functions as fn,Case

class Metrics(Segments):
    def get_metric_result(
        self,
        datasource_id:str,
        aggregates:List[SegmentsAndEvents],
        breakdown:List[str],
        function:str
    ):
        return self.execute_get_query(
            *self.build_metric_compute_query(
                datasource_id=datasource_id,
                aggregates=aggregates,
                breakdown=breakdown,
                function=function
            )
        )
        

    def build_aggregation_function(
        self,
        function:SegmentsAndEventsAggregationsFunctions,
    ):
        if(function == SegmentsAndEventsAggregationsFunctions.SUM):
            return fn.Sum(self.table.event_name)
        if(function == SegmentsAndEventsAggregationsFunctions.COUNT):
            return fn.Count(self.table.event_name)

    def build_metric_compute_query(
        self,
        datasource_id:str,
        aggregates:List[SegmentsAndEvents],
        breakdown:List[str],
        function:str
    ):
        innerquery = ClickHouseQuery.from_(self.table)
        for aggregate in aggregates:
            agg_function = aggregate.aggregations.functions
            property = aggregate.aggregations.property
            variable = aggregate.variable
            
            if agg_function == SegmentsAndEventsAggregationsFunctions.COUNT:
                innerquery = innerquery.select(fn.Date(Field("timestamp")).as_("date"))
                subquery_criterion =[Parameter("event_name") ==property]
                for filter in aggregate.filters:
                    if filter.operator == SegmentsAndEventsFilterOperator.EQUALS:
                        subquery_criterion.append(
                            Field(f"properties.{filter.operand}").isin(filter.values)
                        )
                subquery = Case().when(Criterion.all(subquery_criterion),1).else_(0)
                innerquery = innerquery.select(subquery.as_(variable))
            innerquery = innerquery.where(self.table.datasource_id == Parameter("%(ds_id)s"))
        query = ClickHouseQuery.from_(innerquery.as_("innerquery")).select(Parameter("date"),self.get_metric_function_expression(function)).groupby(Parameter("date"))
        return query.get_sql(), {"ds_id":datasource_id}

    def get_metric_function_expression(
        self,
        function:str
    ):
        try:
            # Parses only variables and single digit numbers to expressions for now
            obj = Conversion(len(function))
            # Changed to postfix notation to maintain precedence
            postfix_expression=obj.infixToPostfix(function)
            expression=None
            stack=[]
            for c in postfix_expression:
                if c=='+' or c=='-' or c=='/' or c=='*':
                    b=stack.pop()
                    a=stack.pop()
                    if c=='+':
                        expression=a+b
                    elif c=='-':
                        expression=a-b
                    elif c=='/':
                        expression=a/b
                    elif c=='*':
                        expression=a*b
                    stack.append(expression)
                elif c>="A" and c<="Z":
                    stack.append(fn.Sum(Field(c)))
                elif c>="1" and c<="9":
                    stack.append(int(c))
        except:
            logging.error(f"Invalid formula expression:\t{function}")
            return fn.Sum(Field("A"))
        return stack[0] if len(stack) == 1 else fn.Sum(Field("A"))


class Conversion:

# Constructor to initialize the class variables
    def __init__(self, capacity):
        self.top = -1
        self.capacity = capacity
        # This array is used a stack
        self.array = []
        # Precedence setting
        self.output = []
        self.precedence = {'+': 1, '-': 1, '*': 2, '/': 2, '^': 3}

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
            elif i == '(':
                self.push(i)

            # If the scanned character is an ')', pop and
            # output from the stack until and '(' is found
            elif i == ')':
                while((not self.isEmpty()) and
                    self.peek() != '('):
                    a = self.pop()
                    self.output.append(a)
                if (not self.isEmpty() and self.peek() != '('):
                    return -1
                else:
                    self.pop()

            # An operator is encountered
            else:
                while(not self.isEmpty() and self.notGreater(i)):
                    self.output.append(self.pop())
                self.push(i)

        # pop all the operator from the stack
        while not self.isEmpty():
            self.output.append(self.pop())

        return "".join(self.output)

