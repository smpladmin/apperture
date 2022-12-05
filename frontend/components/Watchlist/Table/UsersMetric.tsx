import { Flex, Text } from '@chakra-ui/react';
import { SavedItems } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import React from 'react';
import MobileTableActionMenu from './MobileActionMenu';

const UsersMetric = ({ info }: { info: CellContext<SavedItems, number> }) => {
  return (
    <Flex direction={'column'}>
      <Text>{info.getValue()}</Text>
      <MobileTableActionMenu />
    </Flex>
  );
};

export default UsersMetric;
