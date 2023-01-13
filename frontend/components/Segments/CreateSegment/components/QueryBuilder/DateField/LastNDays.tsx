import { Box, Flex, Input, Text } from '@chakra-ui/react';
import React from 'react';

type LastNDaysProps = {
  days: string;
  setDays: Function;
};

const LastNDays = ({ days, setDays }: LastNDaysProps) => {
  return (
    <Box data-testid={'last-N-days'}>
      <Flex alignItems={'center'} gap={'2'}>
        <Input
          autoFocus
          h={'13'}
          w={'60'}
          focusBorderColor={'black.100'}
          borderRadius={'4'}
          type={'number'}
          value={days}
          onChange={(e) => {
            setDays(e.target.value);
          }}
        />
        <Flex h={'13'} bg={'white.100'} alignItems={'center'} px={'4'}>
          <Text fontSize={'base'} lineHeight={'base'} fontWeight={'500'}>
            Days
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default LastNDays;
