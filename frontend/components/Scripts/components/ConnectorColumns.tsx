import React, { useState, ChangeEvent } from 'react';
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import { ConnectionSource } from '@lib/domain/connections';
import { getSearchResult } from '@lib/utils/common';
import { CaretLeft, Columns, MagnifyingGlass } from 'phosphor-react';
import { GREY_600 } from '@theme/index';

type ConnectionsProps = {
  connectorData: ConnectionSource & {
    heirarchy: string[];
  };
  setShowColumns: React.Dispatch<React.SetStateAction<boolean>>;
};

const ConnectorColumns = ({
  connectorData,
  setShowColumns,
}: ConnectionsProps) => {
  const { heirarchy, fields } = connectorData;
  const [columns, setColumns] = useState<string[]>(fields);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    const searchText = e.target.value;
    const searchResults = getSearchResult(fields, searchText, { keys: [] });
    const results = searchResults.length ? searchResults : fields;

    setColumns(results);
  };
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
          maxWidth={'50'}
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
          borderColor={'white.200'}
          placeholder="Search for column..."
          _placeholder={{
            fontSize: 'xs-12',
            lineHeight: 'xs-12',
            fontWeight: '400',
            color: 'grey.700',
          }}
          focusBorderColor="black.100"
          onChange={(e) => onChangeHandler(e)}
        />
      </InputGroup>
      <ViewOnlyColumns columns={columns} />
    </Flex>
  );
};

export default ConnectorColumns;

const ViewOnlyColumns = ({ columns }: { columns: string[] }) => {
  return (
    <Flex direction={'column'}>
      {columns.map((column) => {
        return (
          <Flex
            key={column}
            px={'3'}
            py={'2'}
            gap={3}
            alignItems={'center'}
            _hover={{
              bg: 'white.400',
            }}
            borderRadius={'4'}
          >
            <Columns size={16} color={GREY_600} />
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-12'}
              fontWeight={'400'}
              color={'grey.900'}
              maxWidth={'45'}
            >
              {column}
            </Text>
          </Flex>
        );
      })}
    </Flex>
  );
};
