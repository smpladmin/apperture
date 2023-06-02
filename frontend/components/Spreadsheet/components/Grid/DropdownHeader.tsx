import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
} from '@silevis/reactgrid';
import { CaretDown } from 'phosphor-react';
import { useRef, useState } from 'react';

export interface DropdownHeaderCell extends Cell {
  type: 'dropdownHeader';
  text: string;
  submit?: boolean;
}

export class DropdownHeaderTemplate
  implements CellTemplate<DropdownHeaderCell>
{
  getCompatibleCell(
    uncertainCell: Uncertain<DropdownHeaderCell>
  ): Compatible<DropdownHeaderCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    return { ...uncertainCell, text, value };
  }

  update(
    cell: Compatible<DropdownHeaderCell>,
    cellToMerge: UncertainCompatible<DropdownHeaderCell>
  ): Compatible<DropdownHeaderCell> {
    return this.getCompatibleCell({
      ...cell,
      text: cellToMerge.text,
    });
  }

  render(
    cell: Compatible<DropdownHeaderCell>,
    isInEditMode: boolean,
    onCellChanged: (
      cell: Compatible<DropdownHeaderCell>,
      commit: boolean
    ) => void
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
  cell: Compatible<DropdownHeaderCell>;
  onCellChanged: Function;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formula, setFormula] = useState('');
  const [displayFormulaLabel, setDisplayFormulaLabel] = useState('');

  const ref = useRef(null);
  useOnClickOutside(ref, () => setIsOpen(false));

  const handleSubmitFormula = () => {
    if (formula) {
      onCellChanged(formula);
      setDisplayFormulaLabel(formula);
    }
    setIsOpen(false);
  };

  return (
    <Flex
      w={'full'}
      alignItems={'center'}
      justifyContent={'space-between'}
      position={'relative'}
      overflow={'initial'}
    >
      <Text>{cell.text}</Text>
      <Box>
        <Button
          p={'0'}
          bg={'none'}
          _hover={{ bg: 'none' }}
          h="full"
          borderRadius={0}
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          data-testid={'column-header-icon'}
        >
          <CaretDown size={12} />
        </Button>
        {isOpen && (
          <Box
            ref={ref}
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
            <Flex
              direction={'column'}
              gap={'4'}
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
                Enter formula
              </Text>
              <Input
                defaultValue={formula}
                ref={(input) => input?.focus()}
                onChange={(e) => {
                  e.stopPropagation();
                  setFormula(e.target.value);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  e.code === 'Enter' && handleSubmitFormula();
                }}
                focusBorderColor={'black.100'}
                placeholder={'Enter your formula'}
                data-testid={'formula-input'}
              />
              <Flex gap={'2'} justifyContent={'flex-end'}>
                <Button
                  py={'2'}
                  px={'4'}
                  bg={'white.200'}
                  variant={'secondary'}
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                  data-testid={'cancel-button'}
                  onClick={() => {
                    setIsOpen(false);
                    setFormula(displayFormulaLabel);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  py={'2'}
                  px={'4'}
                  bg={'black.400'}
                  variant={'primary'}
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                  color={'white.DEFAULT'}
                  data-testid={'done-button'}
                  onClick={handleSubmitFormula}
                >
                  Done
                </Button>
              </Flex>
            </Flex>
          </Box>
        )}
      </Box>
    </Flex>
  );
};
