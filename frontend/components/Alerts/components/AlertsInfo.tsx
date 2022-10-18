import { Box, Button, ToastId, useToast } from '@chakra-ui/react';
import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';
import {
  NotificationMetricType,
  ThresholdMetricType,
} from '@lib/domain/notification';
import { setAlert } from '@lib/services/notificationService';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import AlertMetrics from './AlertMetrics';
import PercentageMetric from './PercentageMetric';
import ThresholdMetric from './ThresholdMetric';
import AlertToast from './Toast';
import {
  getMaximumValue,
  getMinimumValue,
  notificationMetricOptions,
  thresholdMetricOptions,
} from '../util';

type AlertsProps = {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
  closeAlertsSheet: () => void;
};

const AlertsInfo = ({ eventData, closeAlertsSheet }: AlertsProps) => {
  const { nodeSignificanceData, trendsData } = eventData;
  const toast = useToast();
  const toastRef = useRef<ToastId>();

  const router = useRouter();
  const { dsId } = router.query;

  const [minHit, setMinHit] = useState(
    getMinimumValue(trendsData as TrendData[], NotificationMetricType.Hits)
  );
  const [maxHit, setMaxHit] = useState(
    getMaximumValue(trendsData as TrendData[], NotificationMetricType.Hits)
  );

  const [notificationMetric, setNotificationMetric] = useState(
    notificationMetricOptions[1].name
  );
  const [thresholdMetric, setThresholdMetric] = useState(
    thresholdMetricOptions[0].name
  );
  const [hitsThresholdRange, setHitsThresholdRange] = useState<number[]>([
    minHit,
    maxHit,
  ]);
  const [percentageValue, setPercentageValue] = useState<number | string>('');

  useEffect(() => {
    setMinHit(
      getMinimumValue(trendsData as TrendData[], NotificationMetricType.Hits)
    );
    setMaxHit(
      getMaximumValue(trendsData as TrendData[], NotificationMetricType.Hits)
    );
    setHitsThresholdRange([
      getMinimumValue(trendsData as TrendData[], NotificationMetricType.Hits),
      getMaximumValue(trendsData as TrendData[], NotificationMetricType.Hits),
    ]);
  }, [trendsData]);

  const closeToast = () => {
    if (toastRef.current) {
      toast.close(toastRef.current);
    }
  };

  const showToast = () => {
    toastRef.current = toast({
      position: 'bottom',
      render: () => <AlertToast closeToast={closeToast} />,
    });
  };

  const setEventAlert = async () => {
    const response = await setAlert(
      dsId as string,
      (nodeSignificanceData?.[0] as NodeSignificanceData)?.['node'],
      notificationMetric,
      thresholdMetric,
      thresholdMetric === ThresholdMetricType.Percentage
        ? [-percentageValue, +percentageValue]
        : hitsThresholdRange
    );

    if (response?.status === 200) {
      closeAlertsSheet();
      showToast();
    }
  };
  return (
    <Box px={'4'} py={'4'} overflowY={'scroll'}>
      <AlertMetrics
        notificationMetric={notificationMetric}
        setNotificationMetric={setNotificationMetric}
        thresholdMetric={thresholdMetric}
        setThresholdMetric={setThresholdMetric}
      />
      {thresholdMetric === ThresholdMetricType.Range ? (
        <ThresholdMetric
          data={eventData?.trendsData as TrendData[]}
          thresholdRange={hitsThresholdRange}
          setThresholdRange={setHitsThresholdRange}
          minHit={minHit}
          maxHit={maxHit}
        />
      ) : null}
      {thresholdMetric === ThresholdMetricType.Percentage ? (
        <PercentageMetric
          percentageValue={percentageValue}
          setPercentageValue={setPercentageValue}
        />
      ) : null}
      <Button
        variant={'primary'}
        rounded={'lg'}
        bg={'black.100'}
        p={6}
        fontSize={{ base: 'xs-14', md: 'base' }}
        lineHeight={{ base: 'xs-14', md: 'base' }}
        fontWeight={'semibold'}
        textColor={'white.100'}
        w={'full'}
        mt={'4'}
        disabled={
          thresholdMetric === ThresholdMetricType.Percentage && !percentageValue
        }
        onClick={setEventAlert}
      >
        Done
      </Button>
    </Box>
  );
};

export default AlertsInfo;
