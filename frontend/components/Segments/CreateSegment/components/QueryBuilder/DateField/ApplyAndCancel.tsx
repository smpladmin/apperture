import { Button, Flex } from '@chakra-ui/react';
import React from 'react';

type ApplyAndCancelProps = {
  closeDropdown: Function;
  handleDateChange: Function;
};

const ApplyAndCancel = ({
  closeDropdown,
  handleDateChange,
}: ApplyAndCancelProps) => {
  return (
    <Flex direction={'column'} gap={'6'}>
      <Flex gap={'2'}>
        <Button
          h={'12'}
          border={'1px'}
          variant={'secondary'}
          borderColor={'white.200'}
          bg={'white.DEFAULT'}
          color={'black.100'}
          borderRadius={'8'}
          flexGrow={'1'}
          onClick={() => closeDropdown()}
          data-testid={'date-dropdown-cancel-button'}
        >
          Cancel
        </Button>
        <Button
          className="done"
          h={'12'}
          variant={'primary'}
          bg={'black.100'}
          color={'white.DEFAULT'}
          borderRadius={'8'}
          flexGrow={'1'}
          onClick={() => handleDateChange()}
          data-testid={'date-dropdown-done-button'}
        >
          Done
        </Button>
      </Flex>
    </Flex>
  );
};

export default ApplyAndCancel;
