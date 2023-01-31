import { Box, Button, ToastId, useToast } from '@chakra-ui/react';
import {
  NotificationEventsData,
  NotificationMetricType,
  NotificationVariant,
  ThresholdMetricType,
} from '@lib/domain/notification';
import { setAlert } from '@lib/services/notificationService';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';
import AlertMetrics from './AlertMetrics';
import PercentageMetric from './PercentageMetric';
import ThresholdMetric from './ThresholdMetric';
import AlertToast from './Toast';
import { NotificationFactory, thresholdMetricOptions } from '../util';

type AlertsProps = {
  name: string;
  eventData: NotificationEventsData;
  closeAlertsSheet: () => void;
  variant: NotificationVariant;
  reference: string;
  datasourceId: string;
};

const AlertsInfo = ({
  name,
  eventData,
  closeAlertsSheet,
  variant,
  reference,
  datasourceId,
}: AlertsProps) => {
  const toast = useToast();
  const toastRef = useRef<ToastId>();

  const router = useRouter();

  const [minHit, setMinHit] = useState(
    NotificationFactory(variant).getMin(eventData, NotificationMetricType.Hits)
  );
  const [maxHit, setMaxHit] = useState(
    NotificationFactory(variant).getMax(eventData, NotificationMetricType.Hits)
  );

  const [notificationMetric, setNotificationMetric] = useState(
    NotificationFactory(variant).metric.name
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
      NotificationFactory(variant).getMin(
        eventData,
        NotificationMetricType.Hits
      )
    );
    setMaxHit(
      NotificationFactory(variant).getMax(
        eventData,
        NotificationMetricType.Hits
      )
    );
    setHitsThresholdRange([
      NotificationFactory(variant).getMin(
        eventData,
        NotificationMetricType.Hits
      ),
      NotificationFactory(variant).getMax(
        eventData,
        NotificationMetricType.Hits
      ),
    ]);
  }, [eventData]);

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
      datasourceId,
      name,
      notificationMetric,
      thresholdMetric,
      thresholdMetric === ThresholdMetricType.Percentage
        ? [-percentageValue, +percentageValue]
        : hitsThresholdRange,
      variant,
      reference
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
          data={eventData}
          thresholdRange={hitsThresholdRange}
          setThresholdRange={setHitsThresholdRange}
          minHit={minHit}
          maxHit={maxHit}
          xField={NotificationFactory(variant).xField}
          yField={NotificationFactory(variant).yField}
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
