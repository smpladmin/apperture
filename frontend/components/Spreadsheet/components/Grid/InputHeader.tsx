import {
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
import { useState } from 'react';
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
}

export class InputHeaderTemplate implements CellTemplate<InputHeaderCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<InputHeaderCell>
  ): Compatible<InputHeaderCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    let addHeader: boolean | undefined;
    try {
      addHeader = getCellProperty(uncertainCell, 'addHeader', 'boolean');
    } catch {
      addHeader = false;
    }
    return { ...uncertainCell, text, value, addHeader };
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

const FormulaDropDownBox = ({
  cell,
  onCellChanged,
}: {
  cell: Compatible<InputHeaderCell>;
  onCellChanged: Function;
}) => {
  const [formula, setFormula] = useState('');
  const [isFocus, setIsFocus] = useState(false);

  const handleSubmitFormula = () => {
    if (formula) {
      onCellChanged({ text: formula });
    }
  };

  const handleAddHeader = () => {
    onCellChanged({ addHeader: true });
  };

  // formula ki static list
  // events ki list // dynamic
  // operators kis static list

  //Search ---->
  //// metric parser se suggestions change , state (to track current position in formula )update in formula.
  // state -> formula/operand/operator/value

  //{formula:unique,operand:event,operator:null,value:null}

  const suggestFormula = (formula: string) => {
    try {
      Metricparser(['user_id', 'event_name']).parse(formula);
    } catch (err: any) {
      const pre_message = err.message.replace(/but.*/, '') || '';
      const post_message = err.message.replace(/.*but/, '') || '';
      console.log(post_message);
      const exp = /"([^"]+)"/g;
      const suggestion = pre_message
        ?.match(exp)
        ?.map((name: string) => name.replace(/"/g, ''));
      const inp = post_message
        ?.match(exp)
        ?.map((name: string) => name.replace(/"/g, ''));
      console.log({ suggestion, inp });
    }
  };

  return (
    <Flex>
      <InputGroup>
        {formula || isFocus ? (
          <InputLeftElement>
            <Text>{'='}</Text>
          </InputLeftElement>
        ) : null}
        <Input
          defaultValue={cell.text}
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
