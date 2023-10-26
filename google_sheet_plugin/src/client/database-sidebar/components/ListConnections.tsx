import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Popover,
  PopoverBody,
  PopoverContent,
  PopoverTrigger,
  Text,
} from '@chakra-ui/react';
import React, { Fragment, useState } from 'react';
import { Connection, ConnectionGroup, ConnectionSource } from '../lib/types';
import { getSearchResult } from '../lib/util';

type ListConnectionsProps = {
  connections: Connection[];
};

const ListConnections = ({ connections }: ListConnectionsProps) => {
  const [showColumns, setShowColumns] = useState(false);
  const [connectorData, setConnectorData] = useState<{
    source: ConnectionSource;
    heirarchy: string[];
  } | null>(null);

  const handleConnectionSelect = (
    source: ConnectionSource,
    heirarchy: string[]
  ) => {
    setConnectorData({ source, heirarchy });
    setShowColumns(true);
  };

  const getConnectionIcon = (connectionName: string) => {
    const icons: { [key: string]: any } = {
      mixpanel: 'https://cdn.apperture.io/mixpanel-new.svg',
      amplitude: 'https://cdn.apperture.io/amplitude-icon.svg',
      clevertap: 'https://cdn.apperture.io/clevertap-icon.png',
      api: 'https://cdn.apperture.io/api.svg',
      google: 'https://cdn.apperture.io/ga-logo-small.svg',
      apperture: 'https://cdn.apperture.io/apperture-filled-logo.svg',
      datamart: 'https://cdn.apperture.io/database.svg',
      csv: 'https://cdn.apperture.io/csv.svg',
    };
    return icons[connectionName] || 'https://cdn.apperture.io/database.svg';
  };
  return (
    <Popover trigger={'click'}>
      <PopoverTrigger>
        <i className="ph ph-squares-four" style={{ cursor: 'pointer' }}></i>
      </PopoverTrigger>
      <PopoverContent rounded={'xl'} px={'12px'}>
        <PopoverBody
          bg={'white'}
          onClick={(e) => e.stopPropagation()}
          maxHeight={'400px'}
          overflow={'auto'}
        >
          {showColumns ? (
            <ListColumns
              connectorData={connectorData}
              setConnectorData={setConnectorData}
              setShowColumns={setShowColumns}
            />
          ) : (
            <>
              {connections.map((connection) => {
                const { server, connection_data } = connection;
                return (
                  <Flex direction={'column'} key={server} overflow={'auto'}>
                    <Flex alignItems={'center'} py={'2'}>
                      <Text
                        as={'span'}
                        fontSize={'12px'}
                        lineHeight={'16px'}
                        fontWeight={'500'}
                        color={'#9E9E9E'}
                        whiteSpace={'nowrap'}
                      >
                        {server}
                      </Text>
                      <Divider orientation="horizontal" color={'grey.400'} />
                    </Flex>
                    <Accordion allowMultiple defaultIndex={[]}>
                      {connection_data.map(
                        (dataGroup: ConnectionGroup, index: number) => {
                          const { provider, connection_source } = dataGroup;
                          return (
                            <Fragment key={provider + index}>
                              <AccordionItem border={0}>
                                <AccordionButton py={'2'} borderRadius={'8'}>
                                  <Flex
                                    gap={'2'}
                                    alignItems={'center'}
                                    ml={'-8px'}
                                  >
                                    <Image
                                      src={getConnectionIcon(provider)}
                                      height={'12px'}
                                      width={'12px'}
                                      alt={'group'}
                                    />
                                    <Text
                                      fontSize={'12px'}
                                      lineHeight={'16px'}
                                      fontWeight={'500'}
                                      color={'#747474'}
                                    >
                                      {provider}
                                    </Text>
                                  </Flex>

                                  <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel p={0}>
                                  {connection_source.map(
                                    (
                                      source: ConnectionSource,
                                      index: number
                                    ) => {
                                      const heirarchy = [
                                        server,
                                        provider,
                                        source.name,
                                      ];
                                      return (
                                        <Flex
                                          key={source.name + index}
                                          px={'2'}
                                          py={'2'}
                                          gap={'2'}
                                          cursor={'pointer'}
                                          _hover={{ bg: 'white.200' }}
                                          borderRadius={'8'}
                                          onClick={() => {
                                            handleConnectionSelect(
                                              source,
                                              heirarchy
                                            );
                                          }}
                                        >
                                          <i
                                            className="ph ph-table"
                                            style={{ color: '#9E9E9E' }}
                                          ></i>
                                          <Text
                                            fontSize={'12px'}
                                            lineHeight={'16px'}
                                            fontWeight={'500'}
                                            color={'#747474'}
                                          >
                                            {source.name}
                                          </Text>
                                        </Flex>
                                      );
                                    }
                                  )}
                                </AccordionPanel>
                              </AccordionItem>
                            </Fragment>
                          );
                        }
                      )}
                    </Accordion>
                  </Flex>
                );
              })}
            </>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default ListConnections;

type ListColumnsProps = {
  connectorData: {
    source: ConnectionSource;
    heirarchy: string[];
  } | null;
  setShowColumns: React.Dispatch<React.SetStateAction<boolean>>;
  setConnectorData: React.Dispatch<
    React.SetStateAction<{
      source: ConnectionSource;
      heirarchy: string[];
    }>
  >;
};

const ListColumns = ({
  connectorData,
  setShowColumns,
  setConnectorData,
}: ListColumnsProps) => {
  const columns = connectorData?.source?.fields || [];
  const [suggestions, setSuggestions] = useState<string[]>(columns);

  const handleSearch = (e) => {
    const val = e.target.value;
    const searchResults = getSearchResult(columns, val, {
      keys: [],
    });

    setSuggestions(searchResults.length ? searchResults : columns);
  };

  return (
    <Flex direction={'column'} gap={'8px'}>
      <Flex gap={'4px'}>
        <i
          className="ph ph-caret-left"
          onClick={() => {
            setShowColumns(false);
            setConnectorData(null);
          }}
          style={{ color: '#9E9E9E' }}
        />
        <Text
          fontSize={'12px'}
          fontWeight={'400'}
          lineHeight={'16px'}
          color={'#747474'}
          wordBreak={'break-word'}
        >
          {connectorData?.heirarchy?.join('/')}
        </Text>
      </Flex>
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
      <Flex direction={'column'}>
        {suggestions?.map((column) => {
          return (
            <Flex
              key={column}
              px={'3'}
              py={'2'}
              gap={3}
              alignItems={'center'}
              cursor={'pointer'}
              _hover={{
                bg: 'white.400',
              }}
              borderRadius={'4'}
            >
              <Box minW={'16px'} minH={'16px'}>
                <i className="ph ph-columns" style={{ color: '#9E9E9E' }}></i>
              </Box>

              <Text
                fontSize={'12px'}
                lineHeight={'16px'}
                fontWeight={'500'}
                color={'#747474'}
              >
                {column}
              </Text>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};
