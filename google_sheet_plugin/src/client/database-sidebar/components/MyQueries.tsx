import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
  Spinner,
  Text,
} from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import { SheetQuery } from '../lib/types';
import {
  getDateFromTimestamp,
  getFormattedTimeIn12HourFormat,
  getSearchResult,
} from '../lib/util';

type MyQueriesProps = {
  setShowEditQuery: React.Dispatch<React.SetStateAction<boolean>>;
  setIsExistingQuerySelected: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedSheetQuery: React.Dispatch<React.SetStateAction<SheetQuery>>;
};

const MyQueries = ({
  setShowEditQuery,
  setIsExistingQuerySelected,
  setSelectedSheetQuery,
}: MyQueriesProps) => {
  const [sheetQueries, setSheetQueries] = useState<SheetQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const apiKey = localStorage.getItem('apiKey') || '';
  const [suggestions, setSuggestions] = useState<SheetQuery[]>([]);

  useEffect(() => {
    const fetchSavedQueries = async () => {
      const response = await serverFunctions.getSheetQueries(apiKey);

      setSheetQueries(response);
      setSuggestions(response);
      setLoading(false);
    };
    setLoading(true);
    fetchSavedQueries();
  }, []);

  const handleSearch = (e) => {
    const val = e.target.value;
    const searchResults = getSearchResult(sheetQueries, val, {
      keys: ['name'],
    });

    setSuggestions(searchResults.length ? searchResults : sheetQueries);
  };

  const handleSelectQuery = (query: SheetQuery) => {
    setSelectedSheetQuery(query);
    setShowEditQuery(true);
    setIsExistingQuerySelected(true);
  };

  return (
    <>
      <Box>
        <Flex
          px={'16px'}
          py={'8px'}
          alignItems={'center'}
          justifyContent={'space-between'}
          borderBottom={'0.4px solid #DFDFDF'}
          bg={'#212121'}
          color={'#ffffff'}
        >
          <Flex alignItems={'center'} gap={'4px'}>
            <i className="ph ph-stack" style={{ color: '#F1AB42' }}></i>
            <Text fontSize={'12px'} fontWeight={'400'} lineHeight={'16px'}>
              My Queries
            </Text>
          </Flex>
          <i className="ph ph-bell"></i>
        </Flex>
        <Flex p={'16px'} pt={'20px'} borderBottom={'0.4px solid #DFDFDF'}>
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
              focusBorderColor="#747474"
            />
          </InputGroup>
        </Flex>
        <Flex direction={'column'}>
          {loading ? (
            <Flex direction={'column'} gap={'6'} p={'4'}>
              <Skeleton height={'16px'} fadeDuration={1} bg={'#f5f5f5'} />
              <Skeleton height={'16px'} fadeDuration={1} bg={'#f5f5f5'} />
            </Flex>
          ) : (
            <Flex
              direction={'column'}
              gap={'8px'}
              pt={'20px'}
              px={'16px'}
              overflow={'auto'}
            >
              {suggestions?.map((query, index) => {
                return (
                  <ListQueryItem
                    query={query}
                    handleSelectQuery={handleSelectQuery}
                    key={query._id}
                  />
                );
              })}
            </Flex>
          )}
        </Flex>
      </Box>
      <Button
        cursor={'pointer'}
        position={'fixed'}
        right={'16px'}
        bottom={'38px'}
        bg={'#212121'}
        px={'12px'}
        py={'8px'}
        border={'0'}
        borderRadius={'12'}
        fontSize={'12px'}
        color={'#fff'}
        onClick={() => {
          setShowEditQuery(true);
          setIsExistingQuerySelected(false);
        }}
        _hover={{ bg: '#212121' }}
      >
        <Flex alignItems={'center'} gap={'4px'}>
          <i className="ph ph-plus" style={{ color: '#EBAC42' }}></i>
          New Query
        </Flex>
      </Button>
    </>
  );
};

export default MyQueries;

type ListQueryItemProps = {
  query: SheetQuery;
  handleSelectQuery: (query: SheetQuery) => void;
};

const ListQueryItem = ({ query, handleSelectQuery }: ListQueryItemProps) => {
  const [showRefresh, setShowRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const apiKey = localStorage.getItem('apiKey') || '';

  const { query: sheetQuery, sheetReference } = query;
  return (
    <Flex
      key={query._id}
      onMouseEnter={() => setShowRefresh(true)}
      onMouseLeave={() => setShowRefresh(false)}
      alignItems={'center'}
      justifyContent={'space-between'}
      border={'0.4px solid #DFDFDF'}
      py={'8px'}
      px={'12px'}
      cursor={'pointer'}
      _hover={{
        bg: '#f5f5f5',
      }}
      onClick={() => handleSelectQuery(query)}
    >
      <Flex direction={'column'} gap={'2px'}>
        <Text fontSize={'12px'} fontWeight={'500'} lineHeight={'16px'}>
          {query.name}
        </Text>
        <Text
          fontSize={'10px'}
          fontWeight={'400'}
          lineHeight={'14px'}
          color={'#747474'}
        >{`Last updated on ${getDateFromTimestamp(
          new Date(query?.updatedAt)
        )} at ${getFormattedTimeIn12HourFormat(
          new Date(query?.updatedAt)
        )}`}</Text>
      </Flex>

      {refreshing ? (
        <Spinner size={'xs'} />
      ) : (
        showRefresh && (
          <i
            className="ph ph-arrow-clockwise"
            style={{ color: '#606060', fontSize: '12px' }}
            onClick={async (e) => {
              e.stopPropagation();
              setRefreshing(true);
              await serverFunctions.executeQuery(
                apiKey,
                sheetQuery,
                true,
                null,
                sheetReference
              );
              setRefreshing(false);
            }}
          ></i>
        )
      )}
    </Flex>
  );
};
