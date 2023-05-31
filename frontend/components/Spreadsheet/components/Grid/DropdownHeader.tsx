import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import {
  Cell,
  CellTemplate,
  Compatible,
  Uncertain,
  UncertainCompatible,
  getCellProperty,
  isAlphaNumericKey,
  isNavigationKey,
  keyCodes,
} from '@silevis/reactgrid';
import { useState } from 'react';

export interface DropdownHeaderCell extends Cell {
  type: 'dropdownHeader';
  text: string;
  submit?: boolean;
}

export class DropdownHeaderTemplate
  implements CellTemplate<DropdownHeaderCell>
{
  state: { isDropdownOpen: boolean; formula: string };
  setState: any;
  constructor() {
    this.state = {
      isDropdownOpen: false,
      formula: '',
    };
    this.setState = (value: any) => (this.state = { ...this.state, ...value });
  }

  getCompatibleCell(
    uncertainCell: Uncertain<DropdownHeaderCell>
  ): Compatible<DropdownHeaderCell> {
    const text = getCellProperty(uncertainCell, 'text', 'string');
    const value = parseFloat(text);
    return { ...uncertainCell, text, value };
  }
  //   handleKeyDown(
  //     cell: Compatible<DropdownHeaderCell>,
  //     keyCode: number,
  //     ctrl: boolean,
  //     shift: boolean,
  //     alt: boolean
  //   ): { cell: Compatible<DropdownHeaderCell>; enableEditMode: boolean } {
  //     if (!ctrl && !alt && isAlphaNumericKey(keyCode))
  //       return { cell, enableEditMode: true };
  //     return {
  //       cell,
  //       enableEditMode: keyCode === keyCodes.POINTER || keyCode === keyCodes.ENTER
  //     };
  //   }

  update(
    cell: Compatible<DropdownHeaderCell>,
    cellToMerge: UncertainCompatible<DropdownHeaderCell>
  ): Compatible<DropdownHeaderCell> {
    return this.getCompatibleCell({ ...cell, text: cellToMerge.text });
  }

  render(
    cell: Compatible<DropdownHeaderCell>,
    isInEditMode: boolean,
    onCellChanged: (
      cell: Compatible<DropdownHeaderCell>,
      commit: boolean
    ) => void
  ): React.ReactNode {
    let value = cell.text;
    const handleChange = (e: any) => {
      value = e.target.value;
    };
    return (
      // <div>
      //   <input
      //     defaultValue={value}
      //     // onChange={(e) =>
      //     // onCellChanged(
      //     //   this.getCompatibleCell({
      //     //     ...cell,
      //     //     text: e.currentTarget.value,
      //     //     submit: false,
      //     //   }),
      //     //   false
      //     // )
      //     // }
      //     onChange={handleChange}
      //     onClick={(e) => {
      //       e.stopPropagation();
      //     }}
      //     onBlur={(e) =>
      //       onCellChanged(
      //         this.getCompatibleCell({ ...cell, text: e.currentTarget.value }),
      //         (e as any).view?.event?.keyCode !== keyCodes.ESCAPE
      //       )
      //     }
      //     onCopy={(e) => e.stopPropagation()}
      //     onCut={(e) => e.stopPropagation()}
      //     onPaste={(e) => e.stopPropagation()}
      //     onPointerDown={(e) => e.stopPropagation()}
      //     onKeyDown={(e) => {
      //       if (isAlphaNumericKey(e.keyCode) || isNavigationKey(e.keyCode))
      //         e.stopPropagation();
      //     }}
      //   />
      // </div>
      <FormulaDropDownBox cell={cell} />
    );
  }
}

const FormulaDropDownBox = ({ cell }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Flex
      w={'full'}
      alignItems={'center'}
      justifyContent={'space-between'}
      position={'relative'}
    >
      <Text>{cell.text}</Text>
      <Box>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          +
        </Button>
        {isOpen && (
          <Box
            position={'fixed'}
            zIndex={'999'}
            bg={'white.DEFAULT'}
            border={'1px'}
            p={'4'}
            borderColor={'white.400'}
          >
            <Flex direction={'column'} gap={'2'}>
              <Input
                ref={(input) => input?.focus()}
                onChange={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              />
              <Button>Submit</Button>
            </Flex>
          </Box>
        )}
      </Box>
    </Flex>
  );
};
