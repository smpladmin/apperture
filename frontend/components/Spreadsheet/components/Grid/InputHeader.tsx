import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
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
import { BLUE_MAIN, GREY_600, WHITE_DEFAULT } from '@theme/index';
import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { Function, Plus, SquaresFour } from 'phosphor-react';
import { SubHeaderColumnType } from '@lib/domain/workbook';
import {
  DimensionParser,
  FormulaParser,
  Metricparser,
} from '@lib/utils/parser';
import { isEqual } from 'lodash';
import { getSearchResult } from '@lib/utils/common';
import { getWorkbookTransientColumn } from '@lib/services/workbookService';
import { useRouter } from 'next/router';
import LoadingSpinner from '@components/LoadingSpinner';

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
  const [formula, setFormula] = useState(cell.text);
  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const metricFunctionNames = ['count(', 'countif('];
  const dimensionFunctionNames = ['unique('];
  const operators = ['=', '!=', '<=', '<', '>=', '>', 'in'];

  const [suggestions, setSuggestions] = useState<string[]>([]);
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

  const [values, setValues] = useState<string[]>([]);
  const [isLoadingValue, setIsLoadingValue] = useState(false);
  const router = useRouter();
  const { dsId } = router.query;

  const handleSubmitFormula = () => {
    if (formula) {
      onCellChanged({ text: formula });
      inputRef?.current?.blur();
    }
  };

  const handleAddHeader = () => {
    onCellChanged({ addHeader: true });
  };

  const generateFormulaString = (cellState: CellState, prevFormula: string) => {
    switch (cellState[ActiveCellState.FORMULA]) {
      case 'count(':
        return `${cellState[ActiveCellState.FORMULA]})`;
      case 'countif(':
        return cellState.OPERATOR === 'in'
          ? `${cellState[ActiveCellState.FORMULA]} ${
              cellState[ActiveCellState.OPERAND]
            } in [${cellState[ActiveCellState.VALUE].join(',')}]`
          : `${cellState[ActiveCellState.FORMULA]}${
              cellState[ActiveCellState.OPERAND]
            }${cellState[ActiveCellState.OPERATOR]}${
              cellState[ActiveCellState.VALUE][0] || ''
            }${cellState[ActiveCellState.EOF]}`;
      case 'unique(':
        return `${cellState[ActiveCellState.FORMULA]}${
          cellState[ActiveCellState.OPERAND]
        }${cellState[ActiveCellState.EOF]}`;

      default:
        return prevFormula;
    }
  };

  const getActiveCellState = (suggestedValues: string[]) => {
    if (
      isEqual(metricFunctionNames.sort(), suggestedValues) ||
      isEqual(dimensionFunctionNames.sort(), suggestedValues)
    ) {
      return ActiveCellState.FORMULA;
    }

    if (isEqual(cell.properties.sort(), suggestedValues)) {
      return ActiveCellState.OPERAND;
    }

    if (isEqual(operators.sort(), suggestedValues)) {
      return ActiveCellState[ActiveCellState.OPERATOR];
    }

    if (suggestedValues.includes(')')) return ActiveCellState.EOF;

    return ActiveCellState.VALUE;
  };

  const suggestFormula = (formula: string) => {
    try {
      cell.columnType === SubHeaderColumnType.DIMENSION
        ? DimensionParser(cell.properties).parse(formula)
        : Metricparser(cell.properties, values.slice(0, 500)).parse(formula);
      setSuggestions([]);

      // if valid formula, commit the formula text
      onCellChanged({ text: formula });
    } catch (err: any) {
      const pre_message = err.message.replace(/but.*/, '') || '';

      const exp = /"([^"]+)"/g;
      const newSuggestions = pre_message
        ?.match(exp)
        ?.map((name: string) => name.replace(/"/g, ''));

      if (newSuggestions && newSuggestions !== suggestions) {
        setActiveCellState(getActiveCellState(newSuggestions.sort()));
      }

      try {
        const cellStateObj = FormulaParser.parse(formula);
        const searchResults = getSearchResult(
          newSuggestions,
          activeCellState === ActiveCellState.VALUE
            ? cellStateObj[activeCellState]?.[0]
            : cellStateObj[activeCellState],
          { keys: [] }
        );

        const suggestions = searchResults?.length
          ? searchResults
          : newSuggestions;

        setSuggestions(suggestions);
      } catch (err) {
        setSuggestions(newSuggestions);
      }
    }
  };

  const handleSubmitSuggestion = (suggestion: string | string[]) => {
    setCellState((prevState) => ({
      ...prevState,
      [activeCellState]: suggestion,
    }));
    setSuggestions([]);
    inputRef?.current?.focus();
  };

  useEffect(() => {
    // parser to extract formula, operand, operator and values
    try {
      const cellStateObj = FormulaParser.parse(formula);
      setCellState(cellStateObj);
    } catch (err) {}
  }, [activeCellState]);

  useEffect(() => {
    const generatedString = generateFormulaString(cellState, formula);
    setFormula(generatedString);
    suggestFormula(generatedString);
  }, [cellState]);

  useEffect(() => {
    if (!cell.properties.includes(cellState.OPERAND)) return;

    const fetchUniqueValues = async () => {
      const response = await getWorkbookTransientColumn(
        dsId as string,
        [
          {
            formula: 'unique',
            property: cellState.OPERAND,
          },
        ],
        [],
        'default',
        'events'
      );
      if (response.status === 200) {
        setValues(
          response.data.data.map(
            (value: { [key: string]: string }) => value[cellState.OPERAND]
          )
        );
      } else {
        setValues([]);
      }
      setIsLoadingValue(false);
    };
    setIsLoadingValue(true);
    fetchUniqueValues();
  }, [cellState.OPERAND]);

  const getDisplayIcon = () => {
    const cellStateIcon = {
      [ActiveCellState.FORMULA]: <Function size={18} color={GREY_600} />,
      [ActiveCellState.OPERAND]: <SquaresFour size={18} color={GREY_600} />,
      [ActiveCellState.OPERATOR]: '',
      [ActiveCellState.VALUE]: '',
      [ActiveCellState.EOF]: '',
    };
    return cellStateIcon[activeCellState];
  };

  const showDropdown = Boolean(suggestions?.length && formula);

  const showCheckboxDropdown =
    showDropdown &&
    activeCellState === ActiveCellState.VALUE &&
    cellState.OPERATOR === 'in';

  return (
    <Flex width={'full'}>
      <Box position={'relative'} width={'full'}>
        <InputGroup>
          {formula || isFocus ? (
            <InputLeftElement h={'6'}>=</InputLeftElement>
          ) : null}
          <Input
            ref={inputRef}
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
              setSuggestions([]);
            }}
            onFocus={(e) => {
              e.stopPropagation();
              setIsFocus(true);
            }}
            onBlur={() => {
              setIsFocus(false);
            }}
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
            width={'full'}
            height={'6'}
            borderRadius={'0'}
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'400'}
            data-testid={'formula-input'}
            disabled={!!cell.disable}
          />
        </InputGroup>
        {showCheckboxDropdown ? (
          <CheckboxDropdown
            data={suggestions}
            values={cellState.VALUE}
            onSubmit={handleSubmitSuggestion}
          />
        ) : showDropdown ? (
          <Box
            w={'96'}
            position={'absolute'}
            zIndex={1}
            bg={'white.DEFAULT'}
            p={'2'}
            borderRadius={'12'}
            borderWidth={'1px'}
            borderColor={'white.200'}
            onPointerDown={(e) => e.stopPropagation()}
            maxHeight={'102'}
            overflow={'scroll'}
          >
            {!isLoadingValue ? (
              suggestions.slice(0, 100).map((suggestion, index) => {
                return (
                  <Flex
                    key={index}
                    px={'2'}
                    py={'3'}
                    gap={'2'}
                    alignItems={'center'}
                    _hover={{ bg: 'white.400' }}
                    cursor={'pointer'}
                    onClick={() => {
                      handleSubmitSuggestion(suggestion);
                    }}
                  >
                    {getDisplayIcon()}
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'500'}
                    >
                      {suggestion}
                    </Text>
                  </Flex>
                );
              })
            ) : (
              <Flex justifyContent={'center'}>
                <LoadingSpinner size={'sm'} />
              </Flex>
            )}
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

const CheckboxDropdown = ({
  data,
  onSubmit,
  values,
}: {
  data: string[];
  onSubmit: Function;
  values: string[];
}) => {
  const [selectedValues, setSelectedValues] = useState(values);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  useEffect(() => {
    if (selectedValues.length === data.length) {
      setIsSelectAllChecked(true);
    } else {
      setIsSelectAllChecked(false);
    }
  }, [selectedValues]);

  const handleAllSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setIsSelectAllChecked(true);
      setSelectedValues(data);
    } else {
      setIsSelectAllChecked(false);
      setSelectedValues([]);
    }
  };
  return (
    <Box
      w={'96'}
      position={'absolute'}
      zIndex={1}
      bg={'white.DEFAULT'}
      p={'2'}
      borderRadius={'12'}
      borderWidth={'1px'}
      borderColor={'white.200'}
      onPointerDown={(e) => e.stopPropagation()}
      maxHeight={'102'}
      overflow={'scroll'}
    >
      <Flex
        direction={'column'}
        gap={'3'}
        data-testid={'property-values-dropdown-container'}
      >
        <Box overflowY={'auto'} maxHeight={'70'}>
          <Checkbox
            colorScheme={'radioBlack'}
            px={'2'}
            py={'3'}
            w={'full'}
            isChecked={isSelectAllChecked}
            onChange={handleAllSelect}
            _hover={{
              bg: 'white.100',
            }}
            data-testid={'select-all-values'}
          >
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'500'}
              cursor={'pointer'}
              color={'black.500'}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {'Select all'}
            </Text>
          </Checkbox>
          <CheckboxGroup
            value={selectedValues}
            onChange={(values: string[]) => {
              setSelectedValues(values);
            }}
          >
            {data.slice(0, 100).map((value: string) => {
              return (
                <Flex
                  as={'label'}
                  gap={'2'}
                  px={'2'}
                  py={'3'}
                  key={value}
                  _hover={{
                    bg: 'white.100',
                  }}
                  data-testid={'property-value-dropdown-option'}
                  borderRadius={'4'}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Checkbox colorScheme={'radioBlack'} value={value}>
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'500'}
                      cursor={'pointer'}
                      color={'black.500'}
                      wordBreak={'break-word'}
                    >
                      {value}
                    </Text>
                  </Checkbox>
                </Flex>
              );
            })}
          </CheckboxGroup>
        </Box>
        <Button
          w="full"
          bg={'black.100'}
          color={'white.DEFAULT'}
          variant={'primary'}
          onClick={() => onSubmit(selectedValues)}
          data-testid={'add-event-property-values'}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Add
        </Button>
      </Flex>
    </Box>
  );
};
