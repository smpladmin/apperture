import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import React from 'react';

type ActionMenuProps = {
  onNotificationClick: Function;
  hasSavedNotification: boolean;
  disableAlert?: boolean;
};

function ActionMenu({
  onNotificationClick,
  hasSavedNotification,
  disableAlert = false,
}: ActionMenuProps) {
  return (
    <Box>
      <Flex mt={'8'} gap={'4'}>
        <Flex
          py={'3'}
          pl={'1'}
          pr={'3'}
          borderRadius={'100'}
          bg={'black.50'}
          alignItems={'center'}
          onClick={() => onNotificationClick()}
          cursor={'pointer'}
          data-testid={'set-alert-button'}
          pointerEvents={disableAlert ? 'none' : 'auto'}
        >
          <IconButton
            aria-label="set alerts"
            variant={'iconButton'}
            icon={<i className="ri-notification-4-line"></i>}
            color={'white.DEFAULT'}
            size={'sm'}
            _hover={{
              bg: 'none',
            }}
          />
          <Text
            textAlign={'center'}
            fontSize={{ base: 'xs-10', md: 'xs-14' }}
            lineHeight={{ base: 'xs-10', md: 'base' }}
            fontWeight={'400'}
            color={'white.DEFAULT'}
          >
            {hasSavedNotification ? 'Manage Alert' : 'Set Alert'}
          </Text>
        </Flex>
        <Flex
          py={'3'}
          pl={'1'}
          pr={'3'}
          borderRadius={'100'}
          bg={'black.50'}
          alignItems={'center'}
        >
          <IconButton
            pl={'0'}
            aria-label="share"
            variant={'iconButton'}
            icon={<i className="ri-upload-2-line"></i>}
            color={'white.DEFAULT'}
            size={'sm'}
            _hover={{
              bg: 'none',
            }}
          />
          <Text
            textAlign={'center'}
            fontSize={{ base: 'xs-10', md: 'xs-14' }}
            lineHeight={{ base: 'xs-10', md: 'base' }}
            fontWeight={'400'}
            color={'white.DEFAULT'}
          >
            Share
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
}

export default ActionMenu;
