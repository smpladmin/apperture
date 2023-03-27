import { Flex, StyleProps } from '@chakra-ui/react';
import React, { PropsWithChildren } from 'react';

const Card = ({ children, ...styleProps }: PropsWithChildren<StyleProps>) => {
  return (
    <Flex
      p={'4'}
      background={'white.DEFAULT'}
      borderColor={'grey.400'}
      borderWidth={'1px'}
      borderStyle={'solid'}
      borderRadius={'12'}
      {...styleProps}
    >
      {children}
    </Flex>
  );
};

export default Card;
