import { Box, Flex } from '@chakra-ui/react';
import { Bell, BookmarkSimple, Share } from 'phosphor-react';
import React from 'react';

type ActionMenuProps = {
  onNotificationClick: Function;
  disableAlert?: boolean;
};

export const ActionMenu = ({
  onNotificationClick,
  disableAlert = false,
}: ActionMenuProps) => {
  return (
    <Flex gap={'6'}>
      <Box cursor={'not-allowed'}>
        <Share />
      </Box>
      <Box
        cursor={disableAlert ? 'not-allowed' : 'pointer'}
        data-testid={'set-alert-button'}
        onClick={() => !disableAlert && onNotificationClick()}
      >
        <Bell />
      </Box>
      <Box cursor={'not-allowed'}>
        <BookmarkSimple />
      </Box>
    </Flex>
  );
};

export default ActionMenu;
