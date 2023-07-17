import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

const EmptySheet = () => {
  const rows = 50;
  const columns = 26;
  return (
    <Flex
      width={'full'}
      height={'full'}
      overflow={'hidden'}
      direction={'column'}
    >
      <>
        {Array.from({ length: rows }).map((_, i) => (
          <Flex direction={'row'} zIndex={'1'} key={i}>
            {Array.from({ length: columns }).map((_, j) => {
              return (
                <Flex key={`${i}-${j}`}>
                  <Box
                    px={'5'}
                    py={'4'}
                    bg={'white.DEFAULT'}
                    borderRightWidth={'0.4px'}
                    borderBottomWidth={'0.4px'}
                    borderColor={'grey.700'}
                  >
                    <Box
                      bg={'white.400'}
                      borderRadius={'4'}
                      minWidth={'50'}
                      width={'auto'}
                      h={'3'}
                    ></Box>
                  </Box>
                </Flex>
              );
            })}
          </Flex>
        ))}
        <Box position={'absolute'} mt={'33'} zIndex={'2'} left={'45%'}>
          <Flex direction={'column'} gap={'2'}>
            <Text fontSize={'xs-16'} lineHeight={'xs-16'} fontWeight={'500'}>
              Start with selecting a table or writing a SQL query
            </Text>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'500'}
              textAlign={'center'}
              color={'grey.500'}
            >
              Aggregate and analyse data based on different criteria.
            </Text>
          </Flex>
        </Box>
      </>
    </Flex>
  );
};

export default EmptySheet;
