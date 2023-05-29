import { Button, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { TransientSheetData } from '@lib/domain/spreadsheet';
import React from 'react';

type AddSheetProps = {
  sheetsLength: number;
  openQueryModal: () => void;
  setSheetsData: Function;
  setSelectedSheetIndex: Function;
};

const AddSheet = ({
  sheetsLength,
  openQueryModal,
  setSheetsData,
  setSelectedSheetIndex,
}: AddSheetProps) => {
  const handleAddNewSheet = (withQuery: boolean) => {
    const newSheet = {
      name: `Sheet ${sheetsLength + 1}`,
      query: withQuery ? 'Select user_id, event_name from events' : '',
      data: [],
      headers: [],
    };
    setSheetsData((state: TransientSheetData[]) => [...state, newSheet]);
    setSelectedSheetIndex(sheetsLength);

    withQuery && openQueryModal();
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
            handleAddNewSheet(true);
          }}
          data-testid={'new-sheet-using-query'}
        >
          Create a new sheet using query
        </MenuItem>
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
          Creat a new blank sheet
        </MenuItem>
      </MenuList>
    </Menu>
  );
};

export default AddSheet;
