import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { SubHeaderColumnType, TransientSheetData } from '@lib/domain/workbook';
import { Plus } from 'phosphor-react';
import React from 'react';

type AddSheetProps = {
  sheetsLength: number;
  openQueryModal: Function;
  setSheetsData: Function;
  setSelectedSheetIndex: Function;
};

const AddSheet = ({
  sheetsLength,
  openQueryModal,
  setSheetsData,
  setSelectedSheetIndex,
}: AddSheetProps) => {
  const handleAddNewSheet = (withQuery: boolean, is_sql: boolean = true) => {
    const newSheet = {
      name: `Sheet ${sheetsLength + 1}`,
      query: withQuery ? 'Select user_id, event_name from events' : '',
      data: [],
      headers: [],
      subHeaders: Array.from({ length: 27 }).map((_, index) => {
        const isBlankSheet = !withQuery && !is_sql;
        return {
          name: '',
          type:
            isBlankSheet && (index === 1 || index === 2)
              ? SubHeaderColumnType.DIMENSION
              : SubHeaderColumnType.METRIC,
        };
      }),
      is_sql,
    };

    setSheetsData((state: TransientSheetData[]) => [...state, newSheet]);
    setSelectedSheetIndex(sheetsLength);

    withQuery && openQueryModal();
  };

  return (
    <Menu>
      <MenuButton
        as={Flex}
        p={'2'}
        alignItems={'center'}
        justifyContent={'center'}
        borderRightWidth={'0.4px'}
        borderColor={'grey.700'}
        borderRadius={'0'}
        _hover={{ bg: 'white.400' }}
        _active={{ bg: 'white.400' }}
        data-testid={'add-sheet'}
        bg={'white.500'}
        h={'full'}
        cursor={'pointer'}
      >
        <Plus size={16} weight="thin" />
      </MenuButton>
      <MenuList>
        <MenuItem
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'400'}
          _focus={{
            bg: 'white.400',
          }}
          onClick={() => {
            handleAddNewSheet(false, false);
          }}
          data-testid={'new-sheet'}
        >
          Create a new blank sheet
        </MenuItem>
        <MenuItem
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'400'}
          _focus={{
            bg: 'white.400',
          }}
          onClick={() => {
            handleAddNewSheet(true);
          }}
          data-testid={'new-sheet-using-query'}
        >
          Fetch data using SQL
        </MenuItem>
        <MenuItem
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'400'}
          _focus={{
            bg: 'white.400',
          }}
          onClick={() => {
            handleAddNewSheet(true, false);
          }}
          data-testid={'new-sheet-using-nlp'}
        >
          Fetch data using Natural Language
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default AddSheet;
