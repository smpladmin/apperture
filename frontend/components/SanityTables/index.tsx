import { Box, Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import EventsTables from './components/EventsTable';
import { getEvents } from '@lib/services/datasourceService';
import { Provider } from '@lib/domain/provider';
import { SanityDataSource } from '@lib/domain/eventData';
import LoadingSpinner from '@components/LoadingSpinner';
import { useRouter } from 'next/router';

const Sanity = () => {
  const sanityDatasources = [
    { id: SanityDataSource.ALL, label: 'ALL' },
    { id: Provider.MIXPANEL, label: 'Mixpanel' },
    { id: SanityDataSource.BACKEND, label: 'Backend CRM' },
    { id: SanityDataSource.USERS, label: 'Users (Google Sheet)' },
  ];
  const router = useRouter();
  const { dsId } = router.query;
  const [selectedTab, setSelectedTab] = useState<Provider | SanityDataSource>(
    SanityDataSource.ALL
  );
  const [isLoading, setIsLoading] = useState(false);
  const [eventData, setEventData] = useState<any>([]);
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  useEffect(() => {
    const fetchEventDetails = async () => {
      const result = await getEvents(dsId as string);
      if (result && result.data.length)
        setSelectedColumns(Object.keys(result.data[0]));
      setEventData(result);
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchEventDetails();
  }, [selectedTab]);
  return (
    <Box px={{ base: '4', md: '30' }} py={'9'} overflowY={'auto'}>
      <Flex justifyContent={'space-between'}>
        <Text fontSize={'sh-20'} lineHeight={'sh-20'} fontWeight={'600'}>
          Data
        </Text>
      </Flex>

      <Flex justifyContent={'flex-start'} mt={'6'}>
        <RadioGroup value="Abc">
          <Flex gap={'3'} direction={'row'}>
            {sanityDatasources.map((sanityDatasource) => {
              return (
                <Flex
                  as={'label'}
                  borderRadius={'100'}
                  bg={'white.DEFAULT'}
                  px={'6'}
                  py={'2'}
                  border={'1px'}
                  borderColor={
                    sanityDatasource.id === selectedTab
                      ? 'black.100'
                      : 'white.200'
                  }
                  cursor={'pointer'}
                  data-testid={'sanityDatasource'}
                  onClick={() => {
                    setSelectedTab(sanityDatasource.id);
                  }}
                >
                  <Text
                    fontSize={{ base: 'xs-12', md: 'xs-14' }}
                    lineHeight={{ base: 'xs-12', md: 'xs-14' }}
                    fontWeight={'500'}
                  >
                    {sanityDatasource.label}
                  </Text>
                  <Radio value={sanityDatasource.id} hidden />
                </Flex>
              );
            })}
          </Flex>
        </RadioGroup>
      </Flex>

      <Box mt={'7'}>
        {isLoading ? (
          <Flex
            w="full"
            h="full"
            justifyContent={'center'}
            alignItems={'center'}
            minH={'50'}
          >
            <LoadingSpinner />
          </Flex>
        ) : (
          <EventsTables
            eventData={eventData}
            selectedColumns={selectedColumns}
          />
        )}
      </Box>
    </Box>
  );
};

export default Sanity;
