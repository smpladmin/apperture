import { Flex } from '@chakra-ui/react';
import React, { ReactNode } from 'react';

const Card = ({
  children,
  minHeight = 'auto',
}: {
  children: ReactNode;
  minHeight?: string;
}) => {
  return (
    <Flex
      p={'4'}
      background={'white.DEFAULT'}
      borderColor={'grey.400'}
      borderWidth={'1px'}
      borderStyle={'solid'}
      borderRadius={'12'}
      minHeight={minHeight}
    >
      {children}
    </Flex>
  );
};

export default Card;
