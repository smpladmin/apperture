import { Divider, Flex, RadioGroup, Text } from '@chakra-ui/react';
import React from 'react';
import AlertMetricOption from './AlertOption';
import { notificationMetricOptions, thresholdMetricOptions } from './util';

type AlertMetricsProps = {
  notificationMetric: string;
  setNotificationMetric: Function;
  thresholdMetric: string;
  setThresholdMetric: Function;
};

const AlertMetrics = ({
  notificationMetric,
  setNotificationMetric,
  thresholdMetric,
  setThresholdMetric,
}: AlertMetricsProps) => {
  return (
    <>
      <Flex direction={'column'} gap={'2'} mb={'4'}>
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'semibold'}>
          When daily
        </Text>

        <RadioGroup
          value={notificationMetric}
          onChange={(value) => setNotificationMetric(value)}
        >
          <Flex gap={'2'}>
            {notificationMetricOptions.map((option) => {
              return (
                <Flex key={option.name}>
                  <AlertMetricOption
                    option={option}
                    isChecked={option.name === notificationMetric}
                  />
                </Flex>
              );
            })}
          </Flex>
        </RadioGroup>
      </Flex>
      <Divider
        orientation="horizontal"
        borderColor={'white.200'}
        opacity={1}
        mb={'4'}
      />

      <Flex direction={'column'} gap={'2'} mb={'4'}>
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'semibold'}>
          moves
        </Text>
        <RadioGroup
          value={thresholdMetric}
          onChange={(value) => setThresholdMetric(value)}
        >
          <Flex gap={'2'}>
            {thresholdMetricOptions.map((option) => {
              return (
                <Flex key={option.name}>
                  <AlertMetricOption
                    option={option}
                    isChecked={option.name === thresholdMetric}
                  />
                </Flex>
              );
            })}
          </Flex>
        </RadioGroup>
      </Flex>
    </>
  );
};

export default AlertMetrics;
