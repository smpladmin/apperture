import { Box, Button, Flex, Highlight, Text, useToast } from '@chakra-ui/react';
import { BLUE_MAIN, GREY_600, WHITE_DEFAULT } from '@theme/index';
import React, { useContext, useEffect, useRef, useState } from 'react';
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
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import CheckboxDropdown from './CheckboxDropdown';
import {
  SheetFormula,
  VALID_SHEET_FORMULA_NAMES,
  extractFormulaName,
  findActiveFormulaPartIndex,
  findCommaIndices,
  highlightFormula,
  isValidSheetFormula,
} from './util';
import {
  Actions,
  GridContext,
} from '@components/AppertureSheets/context/GridContext';
import {
  BaseCellProps,
  InputHeaderCell,
} from '@components/AppertureSheets/types/gridTypes';
import ContentEditable from './Editable';
import { SHEET_FORMULAS } from './util';

enum ActiveCellState {
  BLANK = 'BLANK',
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

type FormulaDropDownBoxProps = BaseCellProps & {
  cell: InputHeaderCell;
  onCellChanged: Function;
};

const FormulaDropDownBox = ({
  cell,
  onCellChanged,
  ...props
}: FormulaDropDownBoxProps) => {
  const { state, dispatch } = useContext(GridContext);
  const { headerFormulas } = state;
  const { columnIndex } = props;

  const formula = headerFormulas?.[columnIndex] || '';

  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const dropdownRef = useRef(null);

  useOnClickOutside(dropdownRef, () => {
    setSuggestions([]);
    setSelectedFormula(undefined);
    handleSubmitFormula();
  });

  const metricFunctionNames = ['count(', 'countif('];
  const dimensionFunctionNames = ['unique('];
  const operators = ['=', '!=', '<=', '<', '>=', '>', 'in'];

  const [suggestions, setSuggestions] = useState<SheetFormula[]>([]);
  const [selectedFormula, setSelectedFormula] = useState<
    SheetFormula | undefined
  >(undefined);
  const [formulaHighlightedPart, setFormulaHighlightedPart] =
    useState<string>();
  const [caretPosition, setCaretPosition] = useState(0);
  const [updateContentEditable, setUpdateContentEditable] = useState(false);

  const [activeCellState, setActiveCellState] = useState<ActiveCellState>(
    ActiveCellState.BLANK
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

  const handleAddHeader = () => {
    onCellChanged({ addHeader: true });
  };

  const generateFormulaString = (cellState: CellState, prevFormula: string) => {
    const { FORMULA, OPERAND, OPERATOR, VALUE, EOF } = cellState;
    switch (FORMULA) {
      case 'count(':
        return `${FORMULA})`;
      case 'countif(':
        return OPERATOR === 'in'
          ? `${FORMULA} ${OPERAND} in [${VALUE.join(',')}]${EOF}`
          : `${FORMULA}${OPERAND}${OPERATOR}${VALUE[0] || ''}${EOF}`;
      case 'unique(':
        return `${FORMULA}${OPERAND}${EOF}`;

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

    if (suggestedValues?.includes(')')) return ActiveCellState.EOF;

    return ActiveCellState.VALUE;
  };

  const suggestFormula = (formula: string) => {
    try {
      cell.columnType === SubHeaderColumnType.DIMENSION
        ? DimensionParser(cell.properties).parse(formula)
        : Metricparser(cell.properties, values.slice(0, 200)).parse(formula);
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
      if (newSuggestions?.includes(')')) {
        setSuggestions([]);
        return;
      }

      try {
        const cellStateObj = FormulaParser.parse(formula);
        const searchResults = getSearchResult(
          activeCellState === ActiveCellState.VALUE ? values : newSuggestions,
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
    const updatedValue = {
      [activeCellState]:
        activeCellState === ActiveCellState.VALUE && !Array.isArray(suggestion)
          ? [suggestion]
          : suggestion,
    };
    activeCellState === ActiveCellState.VALUE
      ? (updatedValue[ActiveCellState.EOF] = ')')
      : null;
    setCellState((prevState) => ({
      ...prevState,
      ...updatedValue,
    }));
    setSuggestions([]);
    inputRef?.current?.focus();
  };

  useEffect(() => {
    // parser to extract formula, operand, operator and values
    if (activeCellState === ActiveCellState.BLANK) return;
    try {
      const cellStateObj = FormulaParser.parse(formula);
      setCellState(cellStateObj);
    } catch (err) {
      console.log(err);
    }
  }, [activeCellState]);

  useEffect(() => {
    if (activeCellState === ActiveCellState.BLANK) return;
    const generatedString = generateFormulaString(cellState, formula);
    // setFormula(generatedString);
    suggestFormula(generatedString);
  }, [cellState]);

  useEffect(() => {
    if (
      !cell.properties.includes(cellState.OPERAND) ||
      cell.columnType === SubHeaderColumnType.DIMENSION
    )
      return;

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
      [ActiveCellState.BLANK]: '',
    };
    return cellStateIcon[activeCellState];
  };

  // show dropdown either  formula is selected or formula suggestions are present
  const showDropdown = Boolean(
    selectedFormula || (suggestions?.length && formula.startsWith('='))
  );

  const showCheckboxDropdown =
    showDropdown &&
    activeCellState === ActiveCellState.VALUE &&
    cellState.OPERATOR === 'in';

  const handleChange = (e: any) => {
    const _formula = e.currentTarget.textContent || '';
    const { columnColorMapping } = highlightFormula(_formula);

    dispatch({
      type: Actions.SET_HEADER_FORMULAS,
      payload: { ...headerFormulas, [columnIndex]: _formula },
    });

    dispatch({
      type: Actions.SET_HIGHLIGHTED_COLUMNS,
      payload: columnColorMapping,
    });

    const suggestions = getSearchResult<SheetFormula>(
      SHEET_FORMULAS,
      _formula,
      {
        keys: ['name'],
        threshold: 0.4,
        minMatchCharLength: 2,
        distance: 10,
      }
    );

    setSuggestions(suggestions);

    if (isValidSheetFormula(_formula, VALID_SHEET_FORMULA_NAMES)) {
      const formulaName = extractFormulaName(_formula);
      const sheetFormula = SHEET_FORMULAS.find(
        (formula) => formula.name === formulaName
      );
      setSelectedFormula(sheetFormula);
    } else {
      setSelectedFormula(undefined);
    }
  };

  const handleSubmitFormula = () => {
    if (formula) {
      if (
        !formula.match(/^unique/) &&
        cell.columnType === SubHeaderColumnType.DIMENSION
      ) {
        toast({
          title: `Dimension column does not accept BODMAS equation`,
          status: 'error',
          variant: 'subtle',
          isClosable: true,
        });
        return;
      }
    }

    onCellChanged({ text: formula });
  };

  const handleSubmitFormulaSuggestion = (suggestion: SheetFormula) => {
    dispatch({
      type: Actions.SET_HEADER_FORMULAS,
      payload: { ...headerFormulas, [columnIndex]: suggestion.value },
    });
    setSelectedFormula(suggestion);
    setFormulaHighlightedPart(suggestion.parts[0]);
    setUpdateContentEditable(true);
  };

  useEffect(() => {
    // on update of caret position, highlight the selected formula part
    if (selectedFormula) {
      const formulaParts = selectedFormula?.parts || [];
      const commaIndices = findCommaIndices(formula);

      const activeFormulaPartIndex = findActiveFormulaPartIndex(
        caretPosition,
        commaIndices
      );

      if (activeFormulaPartIndex < formulaParts.length) {
        setFormulaHighlightedPart(formulaParts[activeFormulaPartIndex]);
      }
    }
  }, [caretPosition]);

  return (
    <Flex width={'full'}>
      <Box position={'relative'} width={'full'} ref={dropdownRef}>
        <Box position={'relative'}>
          <ContentEditable
            formula={formula || cell.text}
            setFormula={handleChange}
            handleSubmitFormula={handleSubmitFormula}
            setCaretPosition={setCaretPosition}
            updateContentEditable={updateContentEditable}
            setUpdateContentEditable={setUpdateContentEditable}
          />
        </Box>

        {showDropdown && (
          <Box
            w={'85'}
            className="formula-dropdown"
            position={'fixed'}
            zIndex={1}
            bg={selectedFormula ? '#e6f4ea' : 'white.DEFAULT'}
            borderRadius={'4'}
            borderWidth={'1px'}
            borderColor={'white.200'}
            onPointerDown={(e) => e.stopPropagation()}
            maxHeight={'102'}
            overflow={'scroll'}
          >
            {selectedFormula ? (
              <Text
                p={2}
                alignItems={'center'}
                fontSize={'xs-12'}
                fontWeight={'700'}
                color={'#137333'}
                maxW={'80'}
                whiteSpace={'break-spaces'}
                fontFamily={'Roboto Mono'}
              >
                <Highlight
                  query={formulaHighlightedPart || ''}
                  styles={{
                    px: 1,
                    borderRadius: 2,
                    bg: '#188038',
                    color: 'white.DEFAULT',
                  }}
                >
                  {selectedFormula.suggestion}
                </Highlight>
              </Text>
            ) : (
              suggestions.map((suggestion, index) => {
                return (
                  <Flex
                    key={index}
                    p={2}
                    gap={'2'}
                    alignItems={'center'}
                    _hover={{ bg: 'white.400' }}
                    cursor={'pointer'}
                    onClick={() => {
                      handleSubmitFormulaSuggestion(suggestion);
                    }}
                  >
                    <Text
                      fontSize={'xs-12'}
                      lineHeight={'xs-14'}
                      fontWeight={'400'}
                      data-testid="suggestion-text"
                      color={'grey.900'}
                      fontFamily={'Roboto Mono'}
                    >
                      {suggestion.name}
                    </Text>
                  </Flex>
                );
              })
            )}
          </Box>
        )}

        {/* {showCheckboxDropdown ? (
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
                      data-testid="suggestion-text"
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
        ) : null} */}
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
          isDisabled={!!cell?.disableAddButton}
        >
          <Plus color={WHITE_DEFAULT} size={16} />
        </Button>
      )}
    </Flex>
  );
};

export default FormulaDropDownBox;
