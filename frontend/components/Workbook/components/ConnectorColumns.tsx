import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import { CaretLeft, MagnifyingGlass, Plus } from 'phosphor-react';
import React from 'react';

const ConnectorColumns = ({ connectorData, setShowColumns }: any) => {
  const { heirarchy, fields } = connectorData;
  return (
    <Flex direction={'column'} gap={'3'}>
      <Flex alignItems={'center'} gap={'2'} px={'3'}>
        <CaretLeft
          size={16}
          onClick={() => setShowColumns(false)}
          style={{ cursor: 'pointer' }}
        />
        <Text
          fontSize={'xs-10'}
          lineHeight={'xs-10'}
          fontWeight={'500'}
          color={'grey.500'}
        >
          {heirarchy.join('/ ')}
        </Text>
      </Flex>
      <InputGroup>
        <InputLeftElement>
          <MagnifyingGlass size={12} weight="thin" />
        </InputLeftElement>
        <Input
          bg={'white.DEFAULT'}
          borderRadius={'8'}
          boxShadow={
            '0px 0px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.06), 0px 3px 3px 0px rgba(0, 0, 0, 0.05), 0px 6px 3px 0px rgba(0, 0, 0, 0.03), 0px 10px 4px 0px rgba(0, 0, 0, 0.01), 0px 16px 4px 0px rgba(0, 0, 0, 0.00)'
          }
          borderColor={'white.200'}
          placeholder="Search for column..."
          _placeholder={{
            fontSize: 'xs-12',
            lineHeight: 'xs-12',
            fontWeight: '400',
            color: 'grey.700',
          }}
          focusBorderColor="black.100"
        />
      </InputGroup>
      <Flex direction={'column'}>
        {fields.map((field: any) => (
          <Flex
            justifyContent={'space-between'}
            alignItems={'center'}
            py={'2'}
            px={'3'}
            key={field}
          >
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'500'}
              color={'grey.900'}
            >
              {field}
            </Text>
            <Box
              p={'1'}
              _hover={{ bg: 'white.200' }}
              cursor={'pointer'}
              borderRadius={'4'}
            >
              <Plus size={14} />
            </Box>
          </Flex>
        ))}
      </Flex>
    </Flex>
  );
};

export default ConnectorColumns;
