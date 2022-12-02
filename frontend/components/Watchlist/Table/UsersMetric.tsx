import { Flex, Text } from '@chakra-ui/react';
import React from 'react';
import MobileTableActionMenu from './MobileActionMenu';

const UsersMetric = ({ info }: any) => {
  return (
    <Flex direction={'column'}>
      <Text>{info.getValue()}</Text>
      <MobileTableActionMenu />
    </Flex>
  );
};

export default UsersMetric;
