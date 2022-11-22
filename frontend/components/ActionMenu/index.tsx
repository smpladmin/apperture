import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import React from 'react';

function ActionMenu() {
  return (
    <Box>
      <Flex mt={'8'} w={'full'} justifyContent={'space-between'}>
        <Box w={20} textAlign={'center'}>
          <IconButton
            minW={{ base: '8', md: '10' }}
            h={{ base: '8', md: '10' }}
            fontWeight={'500'}
            aria-label="set alerts"
            variant={'iconButton'}
            icon={<i className="ri-notification-4-line"></i>}
            rounded={'full'}
            color={'white.DEFAULT'}
            bg={'grey.300'}
          />
          <Text
            mt={2}
            textAlign={'center'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            color={'grey.DEFAULT'}
          >
            Set Alerts
          </Text>
        </Box>
        <Box w={20} textAlign={'center'}>
          <IconButton
            minW={{ base: '8', md: '10' }}
            h={{ base: '8', md: '10' }}
            fontWeight={'500'}
            aria-label="Get Updates"
            variant={'iconButton'}
            icon={<i className="ri-bookmark-line"></i>}
            rounded={'full'}
            color={'white.DEFAULT'}
            bg={'grey.300'}
          />
          <Text
            mt={2}
            textAlign={'center'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            color={'grey.DEFAULT'}
          >
            Get Updates
          </Text>
        </Box>
        <Box w={20} textAlign={'center'}>
          <IconButton
            minW={{ base: '8', md: '10' }}
            h={{ base: '8', md: '10' }}
            fontWeight={'500'}
            aria-label="Journey Map"
            variant={'iconButton'}
            icon={<i className="ri-map-pin-2-line"></i>}
            rounded={'full'}
            color={'white.DEFAULT'}
            bg={'grey.300'}
          />
          <Text
            mt={2}
            textAlign={'center'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            color={'grey.DEFAULT'}
          >
            Journey Map
          </Text>
        </Box>
        <Box w={20} textAlign={'center'}>
          <IconButton
            minW={{ base: '8', md: '10' }}
            h={{ base: '8', md: '10' }}
            fontWeight={'500'}
            aria-label="Share Button"
            variant={'iconButton'}
            icon={<i className="ri-share-forward-2-line"></i>}
            rounded={'full'}
            color={'white.DEFAULT'}
            bg={'grey.300'}
          />
          <Text
            mt={2}
            textAlign={'center'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            color={'grey.DEFAULT'}
          >
            Share
          </Text>
        </Box>
      </Flex>
    </Box>
  );
}

export default ActionMenu;
