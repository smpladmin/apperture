import { Box, Button, Flex, Input, Text } from '@chakra-ui/react';
import { CaretDown } from 'phosphor-react';
import React from 'react';

const Table = () => {
  return (
    <Box pt={10} maxW={336} w={'full'} margin={'auto'}>
      <Text fontWeight={700} fontSize={'base'} lineHeight={'base'}>
        Your Library
      </Text>

      <Flex
        mt={5}
        justifyContent={'space-between'}
        flexDirection={'row'}
        alignItems={'center'}
      >
        <Input placeholder="Search" maxW={88}></Input>
        <Flex gap={3}>
          <Button
            display={'flex'}
            alignItems={'center'}
            gap={2}
            fontWeight={500}
            fontSize={'xs-12'}
            lineHeight={'lh-130'}
            paddingY={2}
            paddingLeft={4}
            paddingRight={3}
            variant={'unstyled'}
          >
            All Explorations <CaretDown />
          </Button>
          <Button
            display={'flex'}
            alignItems={'center'}
            gap={2}
            fontWeight={500}
            fontSize={'xs-12'}
            lineHeight={'lh-130'}
            paddingY={2}
            paddingLeft={4}
            paddingRight={3}
            variant={'unstyled'}
          >
            Created by Anyone <CaretDown />
          </Button>
          <Button
            display={'flex'}
            alignItems={'center'}
            gap={2}
            fontWeight={500}
            fontSize={'xs-12'}
            lineHeight={'lh-130'}
            paddingY={2}
            paddingLeft={4}
            paddingRight={3}
            variant={'unstyled'}
          >
            Latest First <CaretDown />
          </Button>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Table;
