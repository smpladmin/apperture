import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Divider,
  Flex,
  Text,
  ToastId,
  useToast,
} from '@chakra-ui/react';
import {
  NotificationEventsData,
  NotificationMetricType,
  Notifications,
  NotificationVariant,
  ThresholdMetricType,
  NotificationType,
} from '@lib/domain/notification';
import { setAlert, updateAlert } from '@lib/services/notificationService';
import React, { useRef, useState } from 'react';
import AlertMetrics from './AlertMetrics';
import PercentageMetric from './PercentageMetric';
import ThresholdMetric from './ThresholdMetric';
import AlertToast from './Toast';
import {
  NotificationFactory,
  thresholdMetricOptions,
  hasSavedAlert,
} from '../util';
import AlertsGif from '@assets/images/alerts-gif.svg';
import Image from 'next/image';

type AlertsProps = {
  name: string;
  eventData: NotificationEventsData;
  closeAlertsSheet: () => void;
  variant: NotificationVariant;
  reference: string;
  datasourceId: string;
  savedAlert?: Notifications;
};

const AlertsInfo = ({
  name,
  eventData,
  closeAlertsSheet,
  variant,
  reference,
  datasourceId,
  savedAlert,
}: AlertsProps) => {
  const toast = useToast();
  const toastRef = useRef<ToastId>();

  const savedThresholdMetric =
    savedAlert && savedAlert.pctThresholdValues
      ? ThresholdMetricType.Percentage
      : ThresholdMetricType.Range;

  const [notificationType, setNotificationType] = useState<NotificationType[]>(
    savedAlert?.notificationType || [NotificationType.UPDATE]
  );

  const [minHit] = useState(
    savedAlert?.absoluteThresholdValues?.min ||
      NotificationFactory(variant).getMin(
        eventData,
        NotificationMetricType.Hits
      )
  );
  const [maxHit] = useState(
    savedAlert?.absoluteThresholdValues?.max ||
      NotificationFactory(variant).getMax(
        eventData,
        NotificationMetricType.Hits
      )
  );

  const [notificationMetric, setNotificationMetric] = useState(
    savedAlert?.metric || NotificationFactory(variant).metric.name
  );
  const [thresholdMetric, setThresholdMetric] = useState(
    savedThresholdMetric || thresholdMetricOptions[0].name
  );
  const [hitsThresholdRange, setHitsThresholdRange] = useState<number[]>([
    minHit,
    maxHit,
  ]);
  const [percentageValue, setPercentageValue] = useState<number | string>(
    savedAlert?.pctThresholdValues?.max || ''
  );

  const closeToast = () => {
    if (toastRef.current) {
      toast.close(toastRef.current);
    }
  };

  const showToast = (hasError = false) => {
    const hasAlert = savedAlert && hasSavedAlert(savedAlert);
    const toastMessage = hasError
      ? 'Something went wrong.'
      : hasAlert
      ? 'Alert updated'
      : 'Alert created';

    toastRef.current = toast({
      position: 'bottom',
      render: () => (
        <AlertToast
          closeToast={closeToast}
          toastMessage={toastMessage}
          error={hasError || false}
        />
      ),
    });
  };

  const setEventAlert = async () => {
    const hasAlert = savedAlert && hasSavedAlert(savedAlert);
    const response = hasAlert
      ? await updateAlert(
          savedAlert._id,
          datasourceId,
          name,
          notificationType,
          notificationMetric,
          thresholdMetric,
          thresholdMetric === ThresholdMetricType.Percentage
            ? [-percentageValue, +percentageValue]
            : hitsThresholdRange,
          variant,
          reference
        )
      : await setAlert(
          datasourceId,
          name,
          notificationType,
          notificationMetric,
          thresholdMetric,
          thresholdMetric === ThresholdMetricType.Percentage
            ? [-percentageValue, +percentageValue]
            : hitsThresholdRange,
          variant,
          reference
        );

    if (response?.status === 200) {
      showToast();
    } else {
      showToast(true);
    }
    closeAlertsSheet();
  };

  return (
    <Box px={'4'} pt={'2'}>
      <CheckboxGroup
        value={notificationType}
        onChange={(values: NotificationType[]) => {
          setNotificationType(values);
        }}
      >
        <Flex as={'label'} gap={'3'} alignItems={'baseline'}>
          <Checkbox
            value={NotificationType.UPDATE}
            colorScheme={'radioBlack'}
          />
          <Flex direction={'column'} gap={'1'}>
            <Text
              fontSize={{ base: 'base', md: 'sh-20' }}
              lineHeight={{ base: 'base', md: 'sh-20' }}
              fontWeight={'500'}
              cursor={'pointer'}
            >
              {'Daily updates'}
            </Text>
            <Text
              fontSize={{ base: 'xs-12', md: 'xs-14' }}
              lineHeight={{ base: 'xs-12', md: 'xs-14' }}
              fontWeight={'400'}
              color={'grey.200'}
            >
              {'Receive daily trends on this metric'}
            </Text>
          </Flex>
        </Flex>
        <Divider my={{ base: '4', md: '6' }} />
        <Flex as={'label'} gap={'3'} alignItems={'baseline'}>
          <Checkbox value={NotificationType.ALERT} colorScheme={'radioBlack'} />
          <Flex direction={'column'} gap={'1'}>
            <Text
              fontSize={{ base: 'base', md: 'sh-20' }}
              lineHeight={{ base: 'base', md: 'sh-20' }}
              fontWeight={'500'}
              cursor={'pointer'}
            >
              {'Alert me when'}
            </Text>
            <Text
              fontSize={{ base: 'xs-12', md: 'xs-14' }}
              lineHeight={{ base: 'xs-12', md: 'xs-14' }}
              fontWeight={'400'}
              color={'grey.200'}
            >
              {'Get instant alerts on defined conditions'}
            </Text>
          </Flex>
        </Flex>
      </CheckboxGroup>
      {notificationType.includes(NotificationType.ALERT) ? (
        <Box overflowY={'scroll'} mt={'6'} maxH={{ base: '78', md: '90' }}>
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
              metricName={NotificationFactory(variant).metric.name}
            />
          ) : null}
          {thresholdMetric === ThresholdMetricType.Percentage ? (
            <PercentageMetric
              percentageValue={percentageValue}
              setPercentageValue={setPercentageValue}
            />
          ) : null}
        </Box>
      ) : (
        <Image src={AlertsGif} alt={'alert-gif'} />
      )}
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
        isDisabled={
          !Boolean(notificationType.length) ||
          (thresholdMetric === ThresholdMetricType.Percentage &&
            !percentageValue)
        }
        onClick={setEventAlert}
      >
        Done
      </Button>
    </Box>
  );
};

export default AlertsInfo;
