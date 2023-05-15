import { Box, Flex } from '@chakra-ui/react';
import FunnelTrend from '@components/Funnel/components/Trend';
import { Funnel, FunnelTrendsData } from '@lib/domain/funnel';
import {
  _getSavedFunnelPrivate,
  _getTransientTrendsDataPrivate,
} from '@lib/services/funnelService';
import { GetServerSideProps } from 'next';
import React from 'react';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const { funnelId } = query;
  const apiKey = process.env.APPERTURE_API_KEY;

  const savedFunnel: Funnel = await _getSavedFunnelPrivate(
    apiKey!!,
    funnelId as string
  );

  if (!savedFunnel) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  const {
    datasourceId,
    steps,
    dateFilter,
    conversionWindow,
    randomSequence,
    segmentFilter,
  } = savedFunnel;

  const trendsData = await _getTransientTrendsDataPrivate(
    apiKey!!,
    datasourceId,
    steps,
    dateFilter || null,
    conversionWindow || null,
    randomSequence,
    segmentFilter || null
  );

  return {
    props: { trendsData },
  };
};

const Funnel = ({ trendsData }: { trendsData: FunnelTrendsData[] }) => {
  return (
    <Flex w={'full'} h={'full'} justifyContent={'center'} alignItems={'center'}>
      <Box w={'200'}>
        <FunnelTrend data={trendsData} />
      </Box>
    </Flex>
  );
};

export default Funnel;
