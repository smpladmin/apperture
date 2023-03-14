import {
  Button,
  Divider,
  Flex,
  Highlight,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import {
  DateFilter,
  DateFilterType,
  FunnelData,
  FunnelStep,
  FunnelTrendsData,
} from '@lib/domain/funnel';
import React, { useState } from 'react';
import FunnelChart from '../components/FunnelChart';
import Trend from '../components/Trend';
import Loader from '@components/LoadingSpinner';
import UserConversionDrawer from '../components/UserCoversionDrawer';
import { useRouter } from 'next/router';
import DateFilterComponent from '@components/Date/DateFilter';

type TransientFunnelViewProps = {
  isLoading: boolean;
  funnelData: FunnelData[];
  trendsData: FunnelTrendsData[];
  funnelSteps: FunnelStep[];
  dateFilter: DateFilter | null;
  setDateFilter: Function;
  dateFilterType: DateFilterType | null;
  setDateFilterType: Function;
  isDateFilterDisabled?: boolean;
};

const TransientFunnelView = ({
  isLoading,
  funnelData,
  trendsData,
  funnelSteps,
  dateFilter,
  setDateFilter,
  dateFilterType,
  setDateFilterType,
  isDateFilterDisabled = false,
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
    <Flex
      direction={'column'}
      gap={'8'}
      px={{ base: '0', md: '15' }}
      py={{ base: '8', md: '8' }}
      h={'full'}
    >
      <DateFilterComponent
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        dateFilterType={dateFilterType}
        setDateFilterType={setDateFilterType}
        isDisabled={isDateFilterDisabled}
      />

      {isLoading ? (
        <Flex justifyContent={'center'} alignItems={'center'} h={'full'}>
          <Loader />
        </Flex>
      ) : (
        <>
          <Flex justifyContent={'space-between'}>
            <Flex direction={'column'} gap={'1'}>
              <Text
                fontSize={'sh-18'}
                lineHeight={'sh-18'}
                fontWeight={'500'}
                data-testid={'funnel-conversion'}
              >
                <Highlight
                  query={`${funnelConversion}%`}
                  styles={{ fontSize: 'sh-28', fontWeight: 700 }}
                >
                  {`${funnelConversion}% Conversion`}
                </Highlight>
              </Text>
              <Text
                fontSize={'base'}
                lineHeight={'base'}
                fontWeight={'400'}
                color={'grey.100'}
              >
                {`${funnelLastStepUsers} users`}
              </Text>
            </Flex>

            <Button
              h={'15'}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'600'}
              bg={'white.200'}
            >
              {'Analyse Factors'}
            </Button>
          </Flex>
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
          />
          <Flex direction={'column'} gap={'8'}>
            <Text
              fontSize={{ base: 'sh-18', md: 'sh-20' }}
              lineHeight={{ base: 'sh-18', md: 'sh-20' }}
              fontWeight={'semibold'}
            >
              Funnel
            </Text>

            <FunnelChart
              data={funnelData}
              handleChartClick={handleChartClick}
            />
          </Flex>
          <Divider
            orientation="horizontal"
            borderColor={'white.200'}
            opacity={1}
          />
          <Flex direction={'column'} gap={'8'}>
            <Text
              fontSize={{ base: 'sh-18', md: 'sh-20' }}
              lineHeight={{ base: 'sh-18', md: 'sh-20' }}
              fontWeight={'semibold'}
            >
              Trend
            </Text>

            <Trend data={trendsData} />
          </Flex>
        </>
      )}
      <UserConversionDrawer
        isOpen={isDrawerOpen}
        onClose={onDrawerClose}
        datasourceId={dsId as string}
        event={selectedEvent as string}
        selectedFunnelSteps={selectedFunnelSteps}
        dateFilter={dateFilter}
        dateFilterType={dateFilterType}
      />
    </Flex>
  );
};

export default TransientFunnelView;
