import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { BLACK_DEFAULT, GREY_500 } from '@theme/index';
import { CaretDown, Plus } from 'phosphor-react';
import React from 'react';

export const CreateRetentionAction = () => {
  return (
    <Flex direction={'column'} gap={'3'} w={'full'}>
      <Flex px={2} justifyContent={'space-between'} alignItems={'center'}>
        <Flex gap={2} alignItems={'center'}>
          <Text
            color={'grey.500'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            fontWeight={'400'}
          >
            Retention
          </Text>
        </Flex>
      </Flex>
      <Box w={'full'} h={10} bg={'grey.100'} borderRadius={'8'}></Box>
      <Flex
        px={2}
        justifyContent={'space-between'}
        alignItems={'center'}
        mt={3}
      >
        <Flex gap={2} alignItems={'center'}>
          <Text
            color={'grey.500'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            fontWeight={'400'}
          >
            Granularity
          </Text>
        </Flex>
      </Flex>
      <Box w={'full'} h={10} bg={'grey.100'} borderRadius={'8'}></Box>
    </Flex>
  );
};
