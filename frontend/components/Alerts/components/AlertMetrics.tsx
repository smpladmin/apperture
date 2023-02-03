import { Divider, Flex, RadioGroup, Text } from '@chakra-ui/react';
import React from 'react';
import AlertMetricOption from './AlertMetricOption';
import { notificationMetricOptions, thresholdMetricOptions } from '../util';

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
      <Flex direction={'column'} gap={{ base: '2', md: '6' }}>
        <Text
          fontSize={{ base: 'xs-14', md: 'sh-18' }}
          lineHeight={{ base: 'xs-14', md: 'sh-18' }}
          fontWeight={{ base: 'semibold', md: 'medium' }}
        >
          When daily
        </Text>

        <RadioGroup
          value={notificationMetric}
          onChange={(value) => setNotificationMetric(value)}
        >
          <Flex gap={'2'}>
            {notificationMetricOptions.map((option) => {
              return (
                <AlertMetricOption
                  key={option.name}
                  option={{
                    ...option,
                    isDisabled: !Boolean(option.name === notificationMetric),
                  }}
                  isChecked={option.name === notificationMetric}
                />
              );
            })}
          </Flex>
        </RadioGroup>
      </Flex>
      <Divider
        orientation="horizontal"
        borderColor={'white.200'}
        opacity={1}
        my={{ base: '4', md: '8' }}
      />
      <Flex direction={'column'} gap={{ base: '2', md: '6' }}>
        <Text
          fontSize={{ base: 'xs-14', md: 'sh-18' }}
          lineHeight={{ base: 'xs-14', md: 'sh-18' }}
          fontWeight={{ base: 'semibold', md: 'medium' }}
        >
          moves
        </Text>
        <RadioGroup
          value={thresholdMetric}
          onChange={(value) => setThresholdMetric(value)}
        >
          <Flex gap={'2'}>
            {thresholdMetricOptions.map((option) => {
              return (
                <AlertMetricOption
                  key={option.name}
                  option={option}
                  isChecked={option.name === thresholdMetric}
                />
              );
            })}
          </Flex>
        </RadioGroup>
      </Flex>
      <Divider
        orientation="horizontal"
        borderColor={'white.200'}
        opacity={1}
        my={{ base: '4', md: '8' }}
      />
    </>
  );
};

export default AlertMetrics;
