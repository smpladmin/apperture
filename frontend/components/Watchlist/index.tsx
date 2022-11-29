import { Box, Button, Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import React, { useState } from 'react';
import Table from './Table';

const Watchlist = () => {
  const [selected] = useState(false);
  return (
    <Box px={'30'} py={'9'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-20'} lineHeight={'sh-20'} fontWeight={'600'}>
          Saved
        </Text>
        <Button
          px={'6'}
          py={'3'}
          bg={'black.100'}
          variant={'primary'}
          borderRadius={'100'}
          color={'white.DEFAULT'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'500'}
        >
          {'+ Add'}
        </Button>
      </Flex>

      <Flex justifyContent={'flex-start'} mt={'6'}>
        <RadioGroup>
          <Flex gap={'3'}>
            <Button
              borderRadius={'100'}
              bg={'white.DEFAULT'}
              px={'6'}
              py={'2'}
              border={'1px'}
              borderColor={selected ? 'black.100' : 'white.200'}
            >
              <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
                All
              </Text>
              <Radio value={'all'} hidden />
            </Button>
            <Button
              borderRadius={'100'}
              bg={'white.DEFAULT'}
              px={'6'}
              py={'2'}
              border={'1px'}
              borderColor={selected ? 'black.100' : 'white.200'}
            >
              <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
                Events
              </Text>
              <Radio value={'Events'} hidden />
            </Button>
            <Button
              borderRadius={'100'}
              bg={'white.DEFAULT'}
              px={'6'}
              py={'2'}
              border={'1px'}
              borderColor={selected ? 'black.100' : 'white.200'}
            >
              <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
                Funnel
              </Text>
              <Radio value={'Funnel'} hidden />
            </Button>
          </Flex>
        </RadioGroup>
      </Flex>

      <Box mt={'7'}>
        <Table />
      </Box>
    </Box>
  );
};

export default Watchlist;
