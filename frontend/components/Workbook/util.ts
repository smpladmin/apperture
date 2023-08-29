import { Connection, ConnectionSource } from '@lib/domain/connections';
import {
  ColumnType,
  SheetType,
  SpreadSheetColumn,
  SubHeaderColumn,
  SubHeaderColumnType,
  TransientSheetData,
} from '@lib/domain/workbook';
import { Id } from '@silevis/reactgrid';
import { cloneDeep, range } from 'lodash';

export const expressionTokenRegex = /[A-Za-z]+|[0-9]+|[\+\*-\/\^\(\)]/g;

export const generateOtherColumns = (headers: SpreadSheetColumn[]) => {
  return range(headers.length + 1, 27).map((i) => {
    return {
      name: String.fromCharCode(65 + i - 1),
      type: ColumnType.COMPUTED_HEADER,
    };
  });
};

export const fillRows = (data: any[], headers: SpreadSheetColumn[]) => {
  const currentLength = data.length;
  const otherKeys = generateOtherColumns(headers);
  const columns = [...headers, ...otherKeys];

  const gen = range(currentLength + 1, 1001).map((index) => {
    const row: any = {};
    columns.forEach((key) => {
      row[key.name] = { original: '', display: '' };
    });
    // row['index'] = { original: index, display: index };
    return row;
  });

  const dataWitKeys = cloneDeep(data).map((row) => {
    otherKeys.forEach((key) => {
      row[key.name] = { original: '', display: '' };
    });

    return row;
  });

  return [...dataWitKeys, ...gen];
};

export const fillHeaders = (headers: SpreadSheetColumn[]) => {
  const gen = generateOtherColumns(headers);
  const updatedHeaders = [...headers, ...gen];
  updatedHeaders.unshift({ name: 'index', type: ColumnType.QUERY_HEADER });
  return updatedHeaders;
};

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

export const isOperand = (c: string) => {
  if (
    (c.charCodeAt(0) >= 48 && c.charCodeAt(0) <= 57) ||
    (c.charCodeAt(0) >= 65 && c.charCodeAt(0) <= 90)
  )
    return true;
  else return false;
};

export const add = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map(
    (item, index) => item + (second_operand[index] || 0)
  );
};
export const subtract = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map(
    (item, index) => item - (second_operand[index] || 0)
  );
};

export const multiply = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map(
    (item, index) => item * (second_operand[index] || 1)
  );
};

export const divide = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map(
    (item, index) => item / (second_operand[index] || 1)
  );
};

export const power = (first_operand: any[], second_operand: any[]) => {
  return first_operand.map((item, index) =>
    Math.pow(item, second_operand[index] || 1)
  );
};

export const evaluateExpression = (
  expression: string[],
  lookup_table: { [key: string]: Array<any> }
) => {
  const stack: any[] = [];
  const operators: string[] = [];

  const performOperation = () => {
    const operator = operators.pop();

    const operand2 = stack.pop();

    const operand1 = stack.pop();

    switch (operator) {
      case '+':
        stack.push(add(operand1, operand2));
        break;
      case '-':
        stack.push(subtract(operand1, operand2));
        break;
      case '*':
        stack.push(multiply(operand1, operand2));
        break;
      case '/':
        stack.push(divide(operand1, operand2));
        break;
      case '^':
        stack.push(power(operand1, operand2));
        break;
    }
  };

  for (let i = 0; i < expression.length; i++) {
    const token = expression[i];
    if (isOperand(token)) {
      stack.push(lookup_table[token]);
    } else if (token !== '(' && token !== ')' && isOperator(token)) {
      const tokenPriority = getPriority(token);
      while (
        operators.length > 0 &&
        isOperator(operators[operators.length - 1]) &&
        getPriority(operators[operators.length - 1]) >= tokenPriority
      ) {
        performOperation();
      }
      operators.push(token);
    } else if (token === '(') {
      operators.push(token);
    } else if (token === ')') {
      while (operators.length > 0 && operators[operators.length - 1] !== '(') {
        performOperation();
      }
      operators.pop(); // Remove '(' from stack
    }
  }

  while (operators.length > 0) {
    performOperation();
  }

  return stack.pop();
};

export const isSheetPivotOrBlank = (sheet: TransientSheetData) => {
  return (
    sheet?.sheet_type === SheetType.PIVOT_SHEET ||
    (!sheet.is_sql && !sheet.query)
  );
};

export const hasMetricColumnInPivotSheet = (sheet: TransientSheetData) => {
  const { subHeaders, sheet_type } = sheet;
  const isPivotSheet = sheet_type === SheetType.PIVOT_SHEET;

  const filledMetricSubheadersLength = subHeaders.filter(
    (header) => header.name && header.type === SubHeaderColumnType.METRIC
  ).length;
  return !!(isPivotSheet && filledMetricSubheadersLength);
};

export const getSubheaders = (sheetType?: SheetType) => {
  const isPivotSheet = sheetType === SheetType.PIVOT_SHEET;

  return Array.from({ length: 26 }).map((_, index) => {
    return {
      name: '',
      type:
        isPivotSheet && (index === 1 || index === 2)
          ? SubHeaderColumnType.DIMENSION
          : SubHeaderColumnType.METRIC,
    };
  });
};

export const findIndexOfFirstEmptySubheader = (
  subheaders: SubHeaderColumn[],
  subHeaderType: SubHeaderColumnType
) => {
  // ignore 0 index as it is offset for 'index' column in sheet
  return subheaders.findIndex(
    (subheader, index) =>
      index !== 0 && subheader.name === '' && subheader.type === subHeaderType
  );
};

export const dimensionSubheadersLength = (subheaders: SubHeaderColumn[]) => {
  return subheaders.filter(
    (subheader) => subheader.type === SubHeaderColumnType.DIMENSION
  ).length;
};

export const findConnectionByDatasourceId = (
  connections: Connection[],
  datasourceId?: string,
  table?: string
) => {
  for (const connection of connections) {
    for (const connectionGroup of connection.connection_data) {
      for (const connectionSource of connectionGroup.connection_source) {
        if (
          connectionSource.datasource_id === datasourceId ||
          (connectionGroup.provider && connectionSource.table_name === table)
        ) {
          return connectionSource;
        }
      }
    }
  }
  return {} as ConnectionSource;
};

export const findConnectionById = (
  connections: Connection[],
  sourceId: string | undefined | null
) => {
  for (const connection of connections) {
    for (const connectionGroup of connection.connection_data) {
      for (const connectionSource of connectionGroup.connection_source) {
        if (sourceId === connectionSource.id) {
          return connectionSource;
        }
      }
    }
  }
  return {} as ConnectionSource;
};

export const convertToPercentage = (value: number) =>
  `${(value * 100).toFixed(2)}%`;

export const getDecimalPlaces = (number: number | string) => {
  const numberString = number.toString().trim().replace('%', '');
  const decimalIndex = numberString.indexOf('.');
  if (decimalIndex === -1 || decimalIndex === numberString.length - 1) {
    return 0;
  }

  return numberString.length - decimalIndex - 1;
};

export const increaseDecimalPlaces = (
  originalValue: number,
  formattedValue: number | string
) => {
  const decimalPlaces = getDecimalPlaces(formattedValue);
  const updatedDecimalPlaces = Math.min(decimalPlaces + 1, 10);
  const updatedValue =
    typeof formattedValue === 'string' && formattedValue.includes('%')
      ? `${(originalValue * 100).toFixed(updatedDecimalPlaces)}%`
      : originalValue.toFixed(updatedDecimalPlaces);

  return updatedValue;
};

export const decreaseDecimalPlaces = (
  originalValue: number,
  formattedValue: number | string
) => {
  const decimalPlaces = getDecimalPlaces(formattedValue);
  const updatedDecimalPlaces = Math.max(decimalPlaces - 1, 0);
  const updatedValue =
    typeof formattedValue === 'string' && formattedValue.includes('%')
      ? `${(originalValue * 100).toFixed(updatedDecimalPlaces)}%`
      : originalValue.toFixed(updatedDecimalPlaces);

  return updatedValue;
};

export const convertColumnValuesToPercentage = (
  columnIds: Id[],
  columnData: any[]
): any[] => {
  return columnData.map((data) => {
    const toUpdateData = { ...data };

    columnIds.forEach((column) => {
      if (toUpdateData?.[column]) {
        const { original } = toUpdateData?.[column];
        if (typeof original === 'number') {
          toUpdateData[column] = {
            original,
            display: convertToPercentage(original),
          };
        }
      }
    });

    return toUpdateData;
  });
};

export const increaseDecimalPlacesInColumnValues = (
  columnIds: Id[],
  columnData: any[]
): any[] => {
  return columnData.map((data) => {
    const toUpdateData = { ...data };

    columnIds.forEach((column) => {
      if (toUpdateData?.[column]) {
        const { original, display } = toUpdateData[column];
        if (typeof original === 'number')
          toUpdateData[column] = {
            original,
            display: increaseDecimalPlaces(original, display),
          };
      }
    });

    return toUpdateData;
  });
};

export const decreaseDecimalPlacesInColumnValues = (
  columnIds: Id[],
  columnData: any[]
): any[] => {
  return columnData.map((data) => {
    const toUpdateData = { ...data };

    columnIds.forEach((column) => {
      if (toUpdateData?.[column]) {
        const { original, display } = toUpdateData[column];
        if (typeof original === 'number')
          toUpdateData[column] = {
            original,
            display: decreaseDecimalPlaces(original, display),
          };
      }
    });

    return toUpdateData;
  });
};
