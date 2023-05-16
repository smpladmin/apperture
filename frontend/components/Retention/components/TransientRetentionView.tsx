import { Button, ButtonGroup, Flex } from '@chakra-ui/react';
import Card from '@components/Card';
import DateFilterComponent from '@components/Date/DateFilter';
import LoadingSpinner from '@components/LoadingSpinner';
import { DateFilterObj } from '@lib/domain/common';
import { RetentionData, TrendScale } from '@lib/domain/retention';
import { BLACK_DEFAULT, GREY_500 } from '@theme/index';
import { Hash, Percent } from 'phosphor-react';
import { useMemo } from 'react';
import {
  convertToCohortData,
  convertToIntervalData,
  convertToTrendsData,
} from '@components/Retention/utils';
import IntervalTab from './IntervalTab';
import RetentionEmptyState from './RetentionEmptyState';
import RetentionTrend from './RetentionTrend';
import { RetentionCohort } from './RetentionCohort';

type TransientRetentionViewProps = {
  isEmpty: boolean;
  dateFilter: DateFilterObj;
  setDateFilter: Function;
  trendScale: TrendScale;
  setTrendScale: Function;
  isDateFilterDisabled?: boolean;
  isIntervalDataLoading: boolean;
  isTrendsDataLoading: boolean;
  retentionData: RetentionData[];
  pageNumber: number;
  setPageNumber: Function;
  interval: number;
  setInterval: Function;
};

const TransientRetentionView = ({
  dateFilter,
  setDateFilter,
  isDateFilterDisabled,
  trendScale,
  setTrendScale,
  isEmpty,
  isIntervalDataLoading,
  isTrendsDataLoading,
  retentionData,
  pageNumber,
  interval,
  setPageNumber,
  setInterval,
}: TransientRetentionViewProps) => {
  const pageSize = 10;
  const trendsData = useMemo(() => {
    return convertToTrendsData(retentionData, interval);
  }, [interval, retentionData]);

  const intervalData = useMemo(() => {
    return convertToIntervalData(retentionData, pageNumber, pageSize);
  }, [pageNumber, retentionData]);

  const cohortData = useMemo(() => {
    return convertToCohortData(retentionData);
  }, [retentionData]);

  return (
    <Flex direction={'column'} gap={'5'}>
      <Flex justifyContent={'space-between'}>
        <DateFilterComponent
          dateFilter={dateFilter}
          setDateFilter={setDateFilter}
          isDisabled={isDateFilterDisabled}
        />
        <ButtonGroup
          size="sm"
          isAttached
          variant="outline"
          isDisabled={false}
          borderRadius={'8'}
        >
          <Button
            borderWidth={'1px'}
            borderStyle={'solid'}
            borderColor={'grey.400'}
            id="yesterday"
            background={'white.DEFAULT'}
            color={'black.DEFAULT'}
            fontWeight={500}
            _hover={{
              background: 'white.500',
            }}
            height={8}
            fontSize={'xs-12'}
            onClick={() => {
              setTrendScale(TrendScale.ABSOLUTE);
            }}
          >
            <Hash
              size={16}
              color={
                trendScale == TrendScale.ABSOLUTE ? BLACK_DEFAULT : GREY_500
              }
            />
          </Button>
          <Button
            borderWidth={'1px'}
            borderStyle={'solid'}
            borderColor={'grey.400'}
            id="yesterday"
            background={'white.DEFAULT'}
            color={'black.DEFAULT'}
            fontWeight={500}
            _hover={{
              background: 'white.500',
            }}
            height={8}
            fontSize={'xs-12'}
            onClick={() => {
              setTrendScale(TrendScale.PERCENTAGE);
            }}
          >
            <Percent
              size={16}
              color={
                trendScale == TrendScale.PERCENTAGE ? BLACK_DEFAULT : GREY_500
              }
            />
          </Button>
        </ButtonGroup>
      </Flex>
      {isEmpty ? (
        <Card minHeight={'120'} borderRadius={'16'}>
          <RetentionEmptyState />
        </Card>
      ) : (
        <Card p={'0'} borderRadius={'12'} overflow={'hidden'}>
          <Flex w={'full'} direction={'column'}>
            {isIntervalDataLoading ? (
              <Flex
                h={'16'}
                w={'full'}
                alignItems={'center'}
                justifyContent={'center'}
                borderBottom={'1px'}
                borderColor={'grey.400'}
              ></Flex>
            ) : (
              <>
                {intervalData.count ? (
                  <IntervalTab
                    interval={interval}
                    setInterval={setInterval}
                    intervalData={intervalData}
                    setPageNumber={setPageNumber}
                    pageSize={pageSize}
                  />
                ) : null}
              </>
            )}
            {isTrendsDataLoading ? (
              <Flex
                h={'110'}
                w={'full'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <LoadingSpinner />
              </Flex>
            ) : (
              <RetentionTrend data={trendsData} trendScale={trendScale} />
            )}
          </Flex>
        </Card>
      )}
      {isEmpty || !retentionData.length ? (
        <></>
      ) : (
        <Card minHeight={'120'} borderRadius={'16'}>
          {isTrendsDataLoading ? (
            <Flex
              h={'110'}
              w={'full'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <LoadingSpinner />
            </Flex>
          ) : (
            <RetentionCohort
              isLoading={isTrendsDataLoading}
              tableData={cohortData}
            />
          )}
        </Card>
      )}
    </Flex>
  );
};

export default TransientRetentionView;
