import Sheet from 'react-modal-sheet';
import { useEffect, useState } from 'react';
import { Box, Button } from '@chakra-ui/react';
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

enum ThresholdMetricType {
  Range = 'range',
  Percentage = 'percentage',
}

enum NotificationMetricType {
  Users = 'users',
  Hits = 'hits',
}

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
  const [percentageValue, setPercentageValue] = useState('');

  useEffect(() => {
    setMinHits(getMinimumValue(trendsData, 'hits'));
    setMaxHits(getMaximumValue(trendsData, 'hits'));
    setHitsThresholdRange([
      getMinimumValue(trendsData, 'hits'),
      getMaximumValue(trendsData, 'hits'),
    ]);
  }, [(nodeSignificanceData?.[0] as NodeSignificanceData)?.['node']]);

  console.log(
    'percent hai kya',
    notificationMetric === ThresholdMetricType.Percentage && !percentageValue,
    'percnetage',
    !percentageValue
  );
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
