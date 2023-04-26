import { Box, Flex, Highlight, Text, useDisclosure } from '@chakra-ui/react';
import {
  ConversionWindowObj,
  FunnelData,
  FunnelStep,
  FunnelTrendsData,
} from '@lib/domain/funnel';
import React, { useState } from 'react';
import FunnelChart from './FunnelChart';
import Trend from './Trend';
import Loader from '@components/LoadingSpinner';
import UserConversionDrawer from './UserCoversionDrawer';
import { useRouter } from 'next/router';
import DateFilterComponent from '@components/Date/DateFilter';
import { DateFilterObj } from '@lib/domain/common';
import Card from '@components/Card';
import { ArrowRight } from 'phosphor-react';

type TransientFunnelViewProps = {
  isLoading: boolean;
  funnelData: FunnelData[];
  trendsData: FunnelTrendsData[];
  funnelSteps: FunnelStep[];
  dateFilter: DateFilterObj;
  setDateFilter: Function;
  isDateFilterDisabled?: boolean;
  conversionWindow: ConversionWindowObj;
  randomSequence: boolean;
};

const TransientFunnelView = ({
  isLoading,
  funnelData,
  trendsData,
  funnelSteps,
  dateFilter,
  setDateFilter,
  isDateFilterDisabled = false,
  conversionWindow,
  randomSequence,
}: TransientFunnelViewProps) => {
  const {
    isOpen: isDrawerOpen,
    onOpen: onDrawerOpen,
    onClose: onDrawerClose,
  } = useDisclosure();
  const router = useRouter();
  const { dsId } = router.query;
  const [selectedEvent, setSelectedEvent] = useState<string | null>(null);
  const [selectedFunnelSteps, setSelectedFunnelSteps] = useState<FunnelStep[]>(
    []
  );

  const funnelConversion =
    funnelData?.[funnelData.length - 1]?.['conversion'] || 0;
  const funnelLastStepUsers =
    funnelData?.[funnelData.length - 1]?.['users'] || 0;

  const handleChartClick = async (properties: any) => {
    onDrawerOpen();
    const { data } = properties.data;
    const { step, event } = data;
    setSelectedEvent(event.trim());
    const selectedSteps = funnelSteps.slice(0, step);
    setSelectedFunnelSteps(selectedSteps);
  };

  return (
    <Flex direction={'column'} gap={'5'} h={'full'}>
      <DateFilterComponent
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        isDisabled={isDateFilterDisabled}
      />

      {isLoading ? (
        <Flex justifyContent={'center'} alignItems={'center'} h={'full'}>
          <Loader />
        </Flex>
      ) : (
        <>
          <Card borderRadius={'16'}>
            <Flex w={'full'} direction={'column'} gap={15}>
              <Flex
                w={'full'}
                pt={4}
                justifyContent={'space-between'}
                direction={'column'}
                alignItems={'center'}
                gap={4}
              >
                <Flex gap={15}>
                  <Flex direction={'column'} gap={'1'}>
                    <Text
                      fontSize={'sh-18'}
                      lineHeight={'sh-18'}
                      fontWeight={'500'}
                      color={'black.DEFAULT'}
                      data-testid={'funnel-conversion'}
                    >
                      <Highlight
                        query={`${funnelConversion}%`}
                        styles={{
                          fontSize: 'sh-28',
                          lineHeight: 'lh-120',
                          fontWeight: 400,
                        }}
                      >
                        {`${funnelConversion}% `}
                      </Highlight>
                    </Text>
                    <Text
                      fontSize={'xs-12'}
                      lineHeight={'lh-130'}
                      color={'grey.600'}
                      fontWeight={'400'}
                    >
                      Conversion
                    </Text>
                  </Flex>
                  <Flex direction={'column'} gap={'1'}>
                    <Text
                      fontSize={'sh-18'}
                      lineHeight={'sh-18'}
                      fontWeight={'500'}
                      data-testid={'funnel-conversion-users'}
                      color={'black.DEFAULT'}
                    >
                      <Highlight
                        query={`${funnelLastStepUsers}`}
                        styles={{
                          fontSize: 'sh-28',
                          lineHeight: 'lh-120',
                          fontWeight: 400,
                        }}
                      >
                        {`${funnelLastStepUsers}`}
                      </Highlight>
                    </Text>
                    <Text
                      fontSize={'xs-12'}
                      lineHeight={'lh-130'}
                      color={'grey.600'}
                      fontWeight={'400'}
                    >
                      #Users
                    </Text>
                  </Flex>
                </Flex>
                <Flex
                  cursor={'pointer'}
                  borderRadius={'8px'}
                  p={2}
                  justifyContent={'center'}
                  alignItems={'center'}
                  gap={2}
                  fontSize={'xs-12'}
                  lineHeight={'lh-130'}
                  fontWeight={'400'}
                  bg={'white.400'}
                  hidden={true} // enable once Analyse factors is implemented
                >
                  Analyse Factors
                  <ArrowRight size={14} />
                </Flex>
              </Flex>
              <FunnelChart
                data={funnelData}
                handleChartClick={handleChartClick}
              />
            </Flex>
          </Card>

          <Card borderRadius={'16'}>
            <Box w={'full'}>
              <Trend data={trendsData} />
            </Box>
          </Card>
        </>
      )}
      <UserConversionDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        datasourceId={dsId as string}
        event={selectedEvent as string}
        selectedFunnelSteps={selectedFunnelSteps}
        dateFilter={dateFilter}
        conversionWindow={conversionWindow}
        randomSequence={randomSequence}
      />
    </Flex>
  );
};

export default TransientFunnelView;
