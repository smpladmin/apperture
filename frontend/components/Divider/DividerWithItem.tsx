import { Flex } from '@chakra-ui/react';

const DividerWithItem = ({ children, color, ...rest }: any) => {
  return (
    <Flex
      justify={'center'}
      alignItems={'center'}
      w="full"
      h={'1px'}
      bg={color || 'black'}
      {...rest}
    >
      {children}
    </Flex>
  );
};

export default DividerWithItem;
