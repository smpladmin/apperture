import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
} from '@silevis/reactgrid';
import { BLUE_MAIN, WHITE_DEFAULT } from '@theme/index';
import { useEffect, useState } from 'react';
import { Plus } from 'phosphor-react';
import { SubHeaderColumnType } from '@lib/domain/workbook';
import { DimensionParser, Metricparser } from '@lib/utils/parser';

export interface InputHeaderCell extends Cell {
  type: 'inputHeader';
  text: string;
  disable?: boolean;
  showAddButton?: boolean;
  addHeader?: boolean;
  columnType?: SubHeaderColumnType;
  properties: string[];
}

export class InputHeaderTemplate implements CellTemplate<InputHeaderCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<InputHeaderCell>
  ): Compatible<InputHeaderCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    let addHeader: boolean | undefined;
    let properties: string[] | undefined;
    try {
      addHeader = getCellProperty(uncertainCell, 'addHeader', 'boolean');
    } catch {
      addHeader = false;
    }
    try {
      properties = getCellProperty(uncertainCell, 'properties', 'object');
    } catch {
      properties = [];
    }
    return { ...uncertainCell, text, value, addHeader, properties };
  }

  update(
    cell: Compatible<InputHeaderCell>,
    cellToMerge: UncertainCompatible<InputHeaderCell>
  ): Compatible<InputHeaderCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
      addHeader: cellToMerge.addHeader,
    });
  }

  render(
    cell: Compatible<InputHeaderCell>,
    isInEditMode: boolean,
    onCellChanged: (cell: Compatible<InputHeaderCell>, commit: boolean) => void
  ): React.ReactNode {
    return (
      <FormulaDropDownBox
        cell={cell}
        onCellChanged={(updatedCell: any) =>
          onCellChanged(
            this.getCompatibleCell({ ...cell, ...updatedCell }),
            true
          )
        }
      />
    );
  }
}

enum ActiveCellState {
  FORMULA = 'FORMULA',
  OPERAND = 'OPERAND',
  OPERATOR = 'OPERATOR',
  VALUE = 'VALUE',
  EOF = 'EOF',
}
type CellState = {
  [ActiveCellState.FORMULA]: string;
  [ActiveCellState.OPERAND]: string;
  [ActiveCellState.OPERATOR]: string;
  [ActiveCellState.VALUE]: string[];
  [ActiveCellState.EOF]: string;
};

const FormulaDropDownBox = ({
  cell,
  onCellChanged,
}: {
  cell: Compatible<InputHeaderCell>;
  onCellChanged: Function;
}) => {
  const [formula, setFormula] = useState('');
  const [isFocus, setIsFocus] = useState(false);

  const [values, setValues] = useState<{ [key: string]: string[] }>({
    user_id: ['one', 'two', 'three'],
    event_name: ['one', 'two', 'three'],
    'properties.$city': ['one', 'two', 'three'],
    'properties.$os': ['one', 'two', 'three'],
    'properties.$device': ['one', 'two', 'three'],
  });

  const functionNames = ['count(', 'unique(', 'countif('];
  const operators = ['=', '!=', '<=', '<', '>=', '>'];

  const [suggestions, setSuggestions] = useState([]);
  const [activeCellState, setActiveCellState] = useState<ActiveCellState>(
    ActiveCellState.FORMULA
  );
  const [cellState, setCellState] = useState<CellState>({
    [ActiveCellState.FORMULA]: '',
    [ActiveCellState.OPERAND]: '',
    [ActiveCellState.OPERATOR]: '',
    [ActiveCellState.VALUE]: [],
    [ActiveCellState.EOF]: '',
  });

  const getValuesByPropertyName = (property: string) => values[property];

  const handleSubmitFormula = () => {
    if (formula) {
      onCellChanged({ text: formula });
    }
  };

  const handleAddHeader = () => {
    onCellChanged({ addHeader: true });
  };

  useEffect(() => {
    console.log(activeCellState);
  }, [activeCellState]);

  // formula ki static list
  // events ki list // dynamic
  // operators kis static list

  //Search ---->
  //// metric parser se suggestions change , state (to track current position in formula )update in formula.
  // state -> formula/operand/operator/value

  //{formula:unique,operand:event,operator:null,value:null}

  const generateFormulaString = (cellState: CellState, prevFormula: string) => {
    switch (cellState[ActiveCellState.FORMULA]) {
      case 'count(':
        return `${cellState[ActiveCellState.FORMULA]})`;
      case 'countif(':
        return `${cellState[ActiveCellState.FORMULA]}${
          cellState[ActiveCellState.OPERAND]
        }${cellState[ActiveCellState.OPERATOR]}${
          cellState[ActiveCellState.OPERAND] === 'in'
            ? `[${cellState[ActiveCellState.VALUE].join(',')}]`
            : values[0] || ''
        }${cellState[ActiveCellState.EOF]}`;
      case 'unique(':
        return `${cellState[ActiveCellState.FORMULA]}${
          cellState[ActiveCellState.OPERAND]
        }${cellState[ActiveCellState.EOF]}`;

      default:
        return prevFormula;
    }
  };

  const getActiveCellState = (suggestedValue: string) => {
    if (cell.properties.includes(suggestedValue)) {
      return ActiveCellState.OPERAND;
    }

    if (functionNames.includes(suggestedValue)) {
      return ActiveCellState.FORMULA;
    }
    if (operators.includes(suggestedValue)) {
      return ActiveCellState[ActiveCellState.OPERATOR];
    }

    if ([')'].includes(suggestedValue)) return ActiveCellState.EOF;

    return ActiveCellState.VALUE;
  };

  const suggestFormula = (formula: string) => {
    try {
      cell.columnType === SubHeaderColumnType.DIMENSION
        ? DimensionParser(cell.properties).parse(formula)
        : Metricparser(cell.properties).parse(formula);
      setSuggestions([]);
    } catch (err: any) {
      const pre_message = err.message.replace(/but.*/, '') || '';

      const exp = /"([^"]+)"/g;
      const newSuggestions = pre_message
        ?.match(exp)
        ?.map((name: string) => name.replace(/"/g, ''));

      if (newSuggestions && newSuggestions !== suggestions) {
        console.log(newSuggestions[0], cell.properties[0]);
        setActiveCellState(getActiveCellState(newSuggestions[0]));
      }

      setSuggestions(newSuggestions || []);
    }
  };

  const handleSubmitSuggestion = (suggestion: string) => {
    setCellState((prevState) => ({
      ...prevState,
      [activeCellState]: suggestion,
    }));
  };

  useEffect(() => {
    const generatedString = generateFormulaString(cellState, formula);
    setFormula(generatedString);
    suggestFormula(generatedString);
  }, [cellState]);

  return (
    <Flex>
      <Box position={'relative'}>
        <InputGroup>
          {formula || isFocus ? (
            <InputLeftElement>
              <Text>{'='}</Text>
            </InputLeftElement>
          ) : null}
          <Input
            defaultValue={cell.text}
            value={formula}
            border={'0'}
            onChange={(e) => {
              suggestFormula(e.target.value);
              setFormula(e.target.value);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              e.code === 'Enter' && handleSubmitFormula();
            }}
            onFocus={(e) => {
              e.stopPropagation();
              setIsFocus(true);
            }}
            onBlur={() => setIsFocus(false)}
            w={'full'}
            focusBorderColor={'black.100'}
            placeholder={
              isFocus
                ? ''
                : cell.columnType === SubHeaderColumnType.DIMENSION
                ? 'Add Dimension'
                : 'Define Column'
            }
            _placeholder={{
              fontFamily: 'Inter',
              fontSize: 'xs-12',
              lineHeight: 'xs-12',
              fontWeight: 400,
            }}
            data-testid={'formula-input'}
            disabled={!!cell.disable}
          />
        </InputGroup>
        {suggestions.length && formula ? (
          <Box
            w={'112'}
            position={'absolute'}
            zIndex={1}
            bg={'white.DEFAULT'}
            px={'4'}
            py={'5'}
            borderRadius={'12'}
            borderWidth={'1px'}
            borderColor={'white.200'}
            onPointerDown={(e) => e.stopPropagation()}
          >
            {suggestions.map((suggestion, index) => {
              return (
                <Text
                  key={index}
                  onClick={() => handleSubmitSuggestion(suggestion)}
                >
                  {suggestion}
                </Text>
              );
            })}
          </Box>
        ) : null}
      </Box>
      {cell.showAddButton && (
        <Button
          h={'4'}
          w={'4'}
          size={'xs'}
          position={'absolute'}
          right={'-10px'}
          top={'2px'}
          background={BLUE_MAIN}
          borderRadius={'2px'}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          _hover={{
            background: BLUE_MAIN,
          }}
          cursor={'pointer'}
          onClick={(e) => {
            handleAddHeader();
            e.stopPropagation();
          }}
        >
          <Plus color={WHITE_DEFAULT} size={16} />
        </Button>
      )}
    </Flex>
  );
};
