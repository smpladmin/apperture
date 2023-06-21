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
import { useState } from 'react';

export interface InputHeaderCell extends Cell {
  type: 'inputHeader';
  text: string;
  disable?: boolean;
}

export class InputHeaderTemplate implements CellTemplate<InputHeaderCell> {
  getCompatibleCell(
    uncertainCell: Uncertain<InputHeaderCell>
  ): Compatible<InputHeaderCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    return { ...uncertainCell, text, value };
  }

  update(
    cell: Compatible<InputHeaderCell>,
    cellToMerge: UncertainCompatible<InputHeaderCell>
  ): Compatible<InputHeaderCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
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
        onCellChanged={(text: string) =>
          onCellChanged(this.getCompatibleCell({ ...cell, text }), true)
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
  //   console.log('cell', cell);
  const [formula, setFormula] = useState('');
  const [isFocus, setIsFocus] = useState(false);

  const handleSubmitFormula = () => {
    if (formula) {
      onCellChanged(formula);
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
            e.stopPropagation();
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
          placeholder={isFocus ? '' : 'Define Column'}
          data-testid={'formula-input'}
          disabled={!!cell.disable}
        />
      </InputGroup>
      <Button size={'xs'}>+</Button>
    </Flex>
  );
};
