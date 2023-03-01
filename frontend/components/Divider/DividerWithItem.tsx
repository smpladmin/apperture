import { Flex } from '@chakra-ui/react';

const DividerWithItem = ({ children, color }: any) => {
  return (
    <Flex
      justify={'center'}
      alignItems={'center'}
      w="full"
      h={'1px'}
      bg={color || 'black'}
    >
      {children}
    </Flex>
  );
};

export default DividerWithItem;
