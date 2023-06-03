import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { TransientSheetData } from '@lib/domain/spreadsheet';
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
  const handleAddNewSheet = (withQuery: boolean, withNLP: boolean = false) => {
    const newSheet = {
      name: `Sheet ${sheetsLength + 1}`,
      query: withQuery ? 'Select user_id, event_name from events' : '',
      data: [],
      headers: [],
    };
    setSheetsData((state: TransientSheetData[]) => [...state, newSheet]);
    setSelectedSheetIndex(sheetsLength);

    withQuery && openQueryModal(withNLP);
  };

  return (
    <Menu>
      <MenuButton
        as={Button}
        p={'2'}
        borderRightWidth={'0.4px'}
        borderColor={'grey.700'}
        alignItems={'center'}
        justifyContent={'center'}
        bg={'white.500'}
        borderRadius={'0'}
        _hover={{ bg: 'white.400' }}
        _active={{ bg: 'white.400' }}
        data-testid={'add-sheet'}
      >
        +
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
            handleAddNewSheet(false);
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
            handleAddNewSheet(true, true);
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
