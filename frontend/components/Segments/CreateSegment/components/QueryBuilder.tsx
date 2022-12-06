import { Box, Button, Flex, Text } from '@chakra-ui/react';
import { ARROW_GRAY } from '@theme/index';
import { useState } from 'react';

const QueryBuilder = () => {
  const [group, setGroup] = useState([
    {
      filterOperators: [],
      filters: [
        {
          operand: '',
          operator: '',
          value: [],
        },
      ],
    },
  ]);

  return (
    <Box
      p={'4'}
      borderRadius={'12'}
      borderWidth={'0.4px'}
      borderColor={'grey.100'}
      h={'20'}
      mt={'4'}
    >
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'500'}
        color={ARROW_GRAY}
      >
        ALL USERS
      </Text>
      <Flex>
        <Box position={'relative'}>
          <Button>Filter</Button>
          <Box
            position={'absolute'}
            zIndex={99}
            borderRadius={'12'}
            borderWidth={'0.4px'}
            borderColor={'grey.100'}
            bg={'white.DEFAULT'}
            shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
            maxH={'100'}
            overflowY={'auto'}
          >
            <li>14847483498749wewewewewsdsdsde</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
            <li>1</li>
          </Box>
        </Box>
      </Flex>
    </Box>
  );
};

export default QueryBuilder;
