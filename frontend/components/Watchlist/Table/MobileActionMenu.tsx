import { Flex, IconButton } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import React from 'react';
import Render from '@components/Render';

const MobileTableActionMenu = () => {
  return (
    <Render on={'mobile'}>
      <Flex justifyContent={'flex-end'}>
        <IconButton
          aria-label="more"
          variant={'secondary'}
          icon={<i className="ri-more-fill"></i>}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          size={'sm'}
          onClick={(e) => e.stopPropagation()}
        />
      </Flex>
    </Render>
  );
};

export default MobileTableActionMenu;
