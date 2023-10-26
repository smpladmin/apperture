import React, { useState } from 'react';
import ChatTemplate from './ChatTemplate';
import {
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Text,
} from '@chakra-ui/react';
import { WorkbookWithSheet } from '../../../lib/types';
import { getSearchResult } from '../../../lib/util';

type AllQueriesMessageTemplateProps = {
  flattenWorkbooks?: WorkbookWithSheet[];
  onQueryClick: (workbook: WorkbookWithSheet) => Promise<void>;
  timestamp: string;
};

const AllQueriesMessageTemplate = ({
  flattenWorkbooks,
  onQueryClick,
  timestamp,
}: AllQueriesMessageTemplateProps) => {
  const [suggestions, setSuggestions] =
    useState<WorkbookWithSheet[]>(flattenWorkbooks);

  const handleSearch = (e) => {
    const val = e.target.value;
    const searchResults = getSearchResult(flattenWorkbooks, val, {
      keys: ['name', 'sheet.name'],
    });
    setSuggestions(searchResults.length ? searchResults : flattenWorkbooks);
  };
  return (
    <ChatTemplate sender="apperture" timestamp={timestamp}>
      <Flex direction={'column'} gap={'12px'}>
        <Text fontSize={'12px'} fontWeight={'400'} lineHeight={'16px'}>
          Here are all the saved queries. Select a query to run
        </Text>
        <InputGroup width={'100%'}>
          <InputLeftElement top={'-1'}>
            <i
              className="ph ph-magnifying-glass"
              style={{ color: '#747474', fontSize: '10px' }}
            ></i>
          </InputLeftElement>
          <Input
            width={'-webkit-fill-available'}
            size={'sm'}
            py={'4px'}
            px={'10px'}
            height={'30px'}
            borderRadius={'8'}
            border={'0.4px solid #DFDFDF'}
            placeholder="Search queries..."
            background={'#F5F5F5'}
            _placeholder={{
              fontSize: '10px',
              lineHeight: '14px',
              fontWeight: 400,
              color: '#747474',
            }}
            onChange={handleSearch}
            focusBorderColor="#212121"
          />
        </InputGroup>
        <Flex
          direction={'column'}
          gap={'8px'}
          maxH={'220px'}
          overflow={'scroll'}
        >
          {suggestions?.map((workbook, index) => {
            return (
              <Flex
                py={'8px'}
                px={'8px'}
                fontSize={'10px'}
                fontWeight={'500'}
                lineHeight={'14px'}
                key={index}
                cursor={'pointer'}
                direction={'column'}
                _hover={{
                  bg: '#F5F5F5',
                }}
                onClick={() => onQueryClick(workbook)}
              >
                <Text>{workbook.name}</Text>
                <Text color={'#747474'} fontWeight={'400'}>
                  {workbook.sheet.name}
                </Text>
              </Flex>
            );
          })}
        </Flex>
      </Flex>
    </ChatTemplate>
  );
};

export default AllQueriesMessageTemplate;
