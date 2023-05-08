import { Button, ButtonGroup, Flex } from '@chakra-ui/react';
import Card from '@components/Card';
import DateFilterComponent from '@components/Date/DateFilter';
import LoadingSpinner from '@components/LoadingSpinner';
import { DateFilterObj } from '@lib/domain/common';
import {
  RetentionData,
  RetentionTrendsData,
  TrendScale,
} from '@lib/domain/retention';
import { BLACK_DEFAULT, GREY_500 } from '@theme/index';
import { Hash, Percent } from 'phosphor-react';
import IntervalTab from './IntervalTab';
import RetentionEmptyState from './RetentionEmptyState';
import RetentionTrend from './RetentionTrend';

type TransientRetentionViewProps = {
  isEmpty: boolean;
  dateFilter: DateFilterObj;
  setDateFilter: Function;
  trendScale: TrendScale;
  setTrendScale: Function;
  isDateFilterDisabled?: boolean;
  isIntervalDataLoading: boolean;
  isTrendsDataLoading: boolean;
  interval: number;
  setInterval: Function;
  retentionData: RetentionData;
  setPageNumber: Function;
  pageSize: number;
  trendsData: RetentionTrendsData[];
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
  interval,
  setInterval,
  retentionData,
  setPageNumber,
  pageSize,
  trendsData,
}: TransientRetentionViewProps) => {
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
              >
                <LoadingSpinner />
              </Flex>
            ) : (
              <IntervalTab
                interval={interval}
                setInterval={setInterval}
                retentionData={retentionData}
                setPageNumber={setPageNumber}
                pageSize={pageSize}
              />
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
    </Flex>
  );
};

export default TransientRetentionView;
