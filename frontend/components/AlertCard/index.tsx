import { Box, Flex, Text, Highlight, IconButton } from '@chakra-ui/react';
import React from 'react';

function AlertCard() {
  return (
    <Box
      p={4}
      minH={'40'}
      position={'relative'}
      w={'full'}
      bg={'#3E3E47'}
      borderRadius={8}
      overflow={'hidden'}
    >
      <Box
        position={'absolute'}
        w={'100'}
        h={'100'}
        zIndex={'0'}
        bg={
          'linear-gradient(0deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), linear-gradient(0deg, rgba(107, 189, 223, 0.4), rgba(107, 189, 223, 0.4)), #521D7C;'
        }
        opacity={'0.06'}
        sx={{ transform: 'rotate(39deg) translate(50px, -80px)' }}
      />
      <Box
        position={'absolute'}
        w={'100'}
        h={'100'}
        zIndex={'1'}
        bg={
          'linear-gradient(0deg, rgba(255, 255, 255, 0.45), rgba(255, 255, 255, 0.45)), linear-gradient(0deg, rgba(107, 189, 223, 0.4), rgba(107, 189, 223, 0.4)), #521D7C;'
        }
        opacity={'0.06'}
        sx={{ transform: 'rotate(39deg) translate(170px, -80px)' }}
      />
      <Box>
        <Flex
          zIndex={'2'}
          position={'relative'}
          w={'full'}
          justifyContent={'space-between'}
          alignItems={'center'}
        >
          <Text color={'grey.100'} fontSize={'xs-12'} lineHeight={'xs-12'}>
            2 mins ago
          </Text>
          <IconButton
            fontSize={'11'}
            fontWeight={'400'}
            color={'black.150'}
            aria-label="close"
            bg={'white.100'}
            minW={'4'}
            h={'4'}
            rounded={'full'}
            icon={<i className="ri-close-fill"></i>}
          ></IconButton>
        </Flex>
        <Box mt={6} zIndex={'2'} position={'relative'}>
          <Text
            color={'white'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            <Highlight
              query="Checkout Flow"
              styles={{
                px: '1',
                py: '1',
                bg: '#2B2B34',
                fontSize: 'xs-14',
                fontWeight: '600',
                color: 'white',
              }}
            >
              Checkout Flow Conversion Rate was
            </Highlight>
            <Highlight
              query="10.7%"
              styles={{
                px: '1',
                py: '1',
                ml: '1',
                bg: '#8BE99A',
                fontSize: 'xs-14',
                fontWeight: '600',
                color: 'black',
              }}
            >
              10.7%
            </Highlight>
          </Text>
          <Text
            color={'white'}
            mt={2}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
          >
            (2% below average)
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

export default AlertCard;
