import Sheet from 'react-modal-sheet';
import { useEffect, useRef, useState } from 'react';
import { Box, Button, ToastId, useToast } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import AlertMetrics from './AlertMetrics';
import {
  getMaximumValue,
  getMinimumValue,
  notificationMetricOptions,
  thresholdMetricOptions,
} from './util';
import ThresholdMetric from './ThresholdMetric';
import PercentageMetric from './PercentageMetric';
import { OVERLAY_GRAY } from '@theme/index';
import AlertsHeader from './AlertsHeader';
import {
  NodeSignificanceData,
  SankeyData,
  TrendData,
} from '@lib/domain/eventData';
import { setAlert } from '@lib/services/notificationService';
import { useRouter } from 'next/router';
import { ThresholdMetricType } from '@lib/domain/notification';
import AlertToast from './Toast';

type AlertsProps = {
  eventData: {
    [key in string]: Array<TrendData | SankeyData | NodeSignificanceData>;
  };
  isAlertsSheetOpen: boolean;
  closeAlertsSheet: () => void;
};
const Alerts = ({
  eventData,
  isAlertsSheetOpen,
  closeAlertsSheet,
}: AlertsProps) => {
  const { nodeSignificanceData, trendsData } = eventData;
  const toast = useToast();
  const toastRef = useRef<ToastId>();

  const router = useRouter();
  const { dsId } = router.query;

  const [minHits, setMinHits] = useState(getMinimumValue(trendsData, 'hits'));
  const [maxHits, setMaxHits] = useState(getMaximumValue(trendsData, 'hits'));

  const [notificationMetric, setNotificationMetric] = useState(
    notificationMetricOptions[1].name
  );
  const [thresholdMetric, setThresholdMetric] = useState(
    thresholdMetricOptions[0].name
  );
  const [hitsThresholdRange, setHitsThresholdRange] = useState<number[]>([
    minHits,
    maxHits,
  ]);
  const [percentageValue, setPercentageValue] = useState<number | string>('');

  useEffect(() => {
    setMinHits(getMinimumValue(trendsData, 'hits'));
    setMaxHits(getMaximumValue(trendsData, 'hits'));
    setHitsThresholdRange([
      getMinimumValue(trendsData, 'hits'),
      getMaximumValue(trendsData, 'hits'),
    ]);
  }, [(nodeSignificanceData?.[0] as NodeSignificanceData)?.['node']]);

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
    <Sheet
      isOpen={isAlertsSheetOpen}
      onClose={closeAlertsSheet}
      disableDrag={true}
      detent="content-height"
    >
      <Sheet.Container style={{ borderRadius: '1rem 1rem 0 0' }}>
        <Sheet.Header>
          <AlertsHeader closeAlertsSheet={closeAlertsSheet} />
        </Sheet.Header>
        <Sheet.Content>
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
                minHits={minHits}
                maxHits={maxHits}
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
                thresholdMetric === ThresholdMetricType.Percentage &&
                !percentageValue
              }
              onClick={setEventAlert}
            >
              Done
            </Button>
          </Box>
        </Sheet.Content>
      </Sheet.Container>
      <Sheet.Backdrop
        style={{
          background: OVERLAY_GRAY,
          backdropFilter: 'blur(20px)',
        }}
      />
    </Sheet>
  );
};

export default Alerts;
