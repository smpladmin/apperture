import { Box, Flex, Text } from '@chakra-ui/react';
import React from 'react';

type EmtpySheetProps = {
  tableSelected: boolean;
};

const EmptySheet = ({ tableSelected }: EmtpySheetProps) => {
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
          <Flex direction={'row'} zIndex={'1'} key={i} filter="blur(3px)">
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
                    />
                  </Box>
                </Flex>
              );
            })}
          </Flex>
        ))}
        <Box position={'fixed'} mt={'33'} zIndex={'2'} left={'45%'}>

          <Flex direction={'column'} gap={'2'} alignItems={'center'}>
            <Text fontSize={'xs-16'} lineHeight={'xs-16'} fontWeight={'500'}>
              {tableSelected
                ? 'Select columns or Ask AI'
                : 'Start by selecting a table'}
            </Text>
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'500'}
              textAlign={'center'}
              color={'grey.500'}
            >
              You can create any report directly using text input
              {tableSelected
                ? 'You can create any report directly using text input'
                : 'Aggregate and analyse data using excel functions or AI'}
            </Text>
          </Flex>
        </Box>
      </>
    </Flex>
  );
};

export default EmptySheet;
