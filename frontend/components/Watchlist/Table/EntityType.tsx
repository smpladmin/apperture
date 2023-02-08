import React from 'react';
import MetricEntity from '@assets/images/metricEntity.svg';
import FunnelEntity from '@assets/images/funnelEntity.svg';
import EventEntity from '@assets/images/eventEntity.svg';
import {
  NotificationVariant,
  NotificationWithUser,
} from '@lib/domain/notification';
import Image from 'next/image';
import { CellContext } from '@tanstack/react-table';
import { SavedItems } from '@lib/domain/watchlist';
import { Flex, Text } from '@chakra-ui/react';

const EntityType = ({ info }: { info: CellContext<SavedItems, string> }) => {
  const EntityImage = {
    [NotificationVariant.FUNNEL]: <Image src={FunnelEntity} alt={'funnel'} />,
    [NotificationVariant.METRIC]: <Image src={MetricEntity} alt={'metric'} />,
    [NotificationVariant.NODE]: <Image src={EventEntity} alt={'node'} />,
    [NotificationVariant.SEGMENT]: <Image src={EventEntity} alt={'node'} />,
  };

  const { details } = info.row.original;
  const { variant } = details as NotificationWithUser;

  return (
    <Flex gap={'2'}>
      {EntityImage[variant]}
      <Text fontSize={'base'} lineHeight={'base'} fontWeight={'500'}>
        {info.getValue()}
      </Text>
    </Flex>
  );
};

export default EntityType;
