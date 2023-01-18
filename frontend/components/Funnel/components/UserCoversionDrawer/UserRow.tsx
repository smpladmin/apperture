import { Flex, IconButton, Text } from '@chakra-ui/react';
import React from 'react';

const UserRow = ({ name, handleRowClick }: any) => {
  const handleClick = () => {
    handleRowClick(name);
  };
  return (
    <Flex
      justifyContent={'space-between'}
      onClick={handleClick}
      cursor={'pointer'}
      alignContent={'center'}
      alignItems={'center'}
      px={5}
      py={3}
    >
      <Text
        fontWeight={400}
        fontSize={'14px'}
        lineHeight={'22px'}
        wordBreak={'break-all'}
      >
        {name}
      </Text>
      <IconButton
        fontWeight={'500'}
        aria-label="Journey Map"
        variant={'iconButton'}
        icon={<i className="ri-arrow-right-s-line"></i>}
        rounded={'full'}
        color={'grey.100'}
        _hover={{}}
        h={'min-content'}
      />
    </Flex>
  );
};

export default UserRow;
