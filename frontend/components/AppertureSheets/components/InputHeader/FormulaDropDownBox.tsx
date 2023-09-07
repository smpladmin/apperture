import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
  useToast,
} from '@chakra-ui/react';
import { BLUE_MAIN, GREY_600, WHITE_DEFAULT } from '@theme/index';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
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
import ContentEditable, {
  ContentEditableEvent,
} from 'react-controlled-contenteditable';
import { highlightFormula } from './util';
import sanitizeHtml from 'sanitize-html';

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

const FormulaDropDownBox = ({
  cell,
  onCellChanged,
}: {
  cell: any;
  onCellChanged: Function;
}) => {
  const [formula, setFormula] = useState(cell.text);

  const [isFocus, setIsFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const editableRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef(null);

  useOnClickOutside(dropdownRef, () => setSuggestions([]));

  const metricFunctionNames = ['count(', 'countif('];
  const dimensionFunctionNames = ['unique('];
  const operators = ['=', '!=', '<=', '<', '>=', '>', 'in'];

  const [suggestions, setSuggestions] = useState<string[]>([]);
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

  useEffect(() => {
    setFormula(cell.text);
  }, [cell.text]);

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

  // useEffect(() => {
  //   if (activeCellState === ActiveCellState.BLANK) return;
  //   const generatedString = generateFormulaString(cellState, formula);
  //   setFormula(generatedString);
  //   suggestFormula(generatedString);
  // }, [cellState]);

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

  const showDropdown = Boolean(suggestions?.length && formula);

  const showCheckboxDropdown =
    showDropdown &&
    activeCellState === ActiveCellState.VALUE &&
    cellState.OPERATOR === 'in';

  const handleChange = (e: ContentEditableEvent) => {
    e.stopPropagation();
    const _formula = e.currentTarget.textContent || '';
    const sanitizeConf = {
      allowedTags: ['span'],
      allowedAttributes: { span: ['style'] },
    };

    // const highlightedFormula = highlightFormula(formula);
    // const sanitizedContent = sanitizeHtml(highlightedFormula, sanitizeConf);
    console.log('formula', { formula, hightlight: highlightFormula(_formula) });

    setFormula(_formula);
  };

  const handleSubmitFormula = () => {
    // if (formula) {
    //   if (
    //     !formula.match(/^unique/) &&
    //     cell.columnType === SubHeaderColumnType.DIMENSION
    //   ) {
    //     toast({
    //       title: `Dimension column does not accept BODMAS equation`,
    //       status: 'error',
    //       variant: 'subtle',
    //       isClosable: true,
    //     });
    //     return;
    //   }
    // }

    onCellChanged({ text: formula });
  };

  return (
    <Flex width={'full'}>
      <Box position={'relative'} width={'full'} ref={dropdownRef}>
        {/* <InputGroup p={'0'}>
          <Input
            ref={inputRef}
            value={formula}
            autoFocus
            border={'0'}
            onChange={handleChange}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
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
            placeholder={''}
            _placeholder={{
              fontFamily: 'Inter',
              fontSize: 'xs-12',
              lineHeight: 'xs-12',
              fontWeight: 400,
            }}
            _disabled={{
              fontWeight: 600,
            }}
            width={'full'}
            height={'6'}
            px={1}
            borderRadius={'0'}
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'600'}
            data-testid={'formula-input'}
            disabled={!!cell.disable}
          />
        </InputGroup> */}

        <div
          ref={editableRef}
          contentEditable
          onBeforeInput={(e: any) => {
            console.log({ e });
            if (e?.data) {
              handleChange(e);
            }
          }}
          suppressContentEditableWarning
          style={{
            border: '1px solid #ccc',
            padding: '5px',
            // minHeight: '30px',
          }}
          onClick={(e) => e.stopPropagation()}
          // onInput={handleChange}
          onKeyDown={(e) => {
            e.stopPropagation();
            e.code === 'Enter' && handleSubmitFormula();
            setSuggestions([]);
          }}
          dangerouslySetInnerHTML={{ __html: highlightFormula(formula) }}
        ></div>
        {/* <ContentEditable
          onChange={handleChange}
          style={{
            border: '1px solid #ccc',
            padding: '5px',
          }}
          // onKeyDown={(e) => {
          //   e.code === 'Enter' && handleSubmitFormula();
          //   setSuggestions([]);
          // }}
          // onBlur={handleSubmitFormula}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
          html={highlightFormula(formula)}
          tagName="div"
        /> */}
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
          disabled={!!cell?.disableAddButton}
        >
          <Plus color={WHITE_DEFAULT} size={16} />
        </Button>
      )}
    </Flex>
  );
};

export default FormulaDropDownBox;
