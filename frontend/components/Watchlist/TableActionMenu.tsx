import { Flex, IconButton } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import React from 'react';

const TableActionMenu = () => {
  return (
    <Flex gap={'2'} alignItems={'center'}>
      <IconButton
        aria-label="alert"
        variant={'secondary'}
        icon={<i className="ri-alarm-line"></i>}
        rounded={'full'}
        bg={'white.DEFAULT'}
        border={'1px'}
        color={'white.200'}
        borderColor={'white.200'}
      />
      <IconButton
        aria-label="notification"
        variant={'secondary'}
        icon={<i className="ri-notification-line"></i>}
        rounded={'full'}
        bg={'white.DEFAULT'}
        border={'1px'}
        color={'white.200'}
        borderColor={'white.200'}
      />
      <IconButton
        aria-label="more"
        variant={'secondary'}
        icon={<i className="ri-more-fill"></i>}
        rounded={'full'}
        bg={'white.DEFAULT'}
        border={'1px'}
        borderColor={'white.200'}
      />
    </Flex>
  );
};

export default TableActionMenu;
