import { Flex, Text } from '@chakra-ui/react';
import { ActionWithUser } from '@lib/domain/action';
import { Funnel, FunnelWithUser } from '@lib/domain/funnel';
import { MetricWithUser } from '@lib/domain/metric';
import { DataMartWithUser } from '@lib/domain/datamart';
import { RetentionWithUser } from '@lib/domain/retention';
import { NotificationWithUser } from '@lib/domain/notification';
import { SegmentWithUser } from '@lib/domain/segment';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { WorkbookWithUser } from '@lib/domain/workbook';
import { CellContext } from '@tanstack/react-table';

export const Details = ({
  info,
}: {
  info: CellContext<
    SavedItems,
    | FunnelWithUser
    | SegmentWithUser
    | MetricWithUser
    | NotificationWithUser
    | ActionWithUser
    | WorkbookWithUser
    | RetentionWithUser
    | DataMartWithUser
  >;
}) => {
  const { type, details } = info?.row?.original;

  const getSteps = () => {
    if (type === WatchListItemType.FUNNELS) {
      const { steps } = details as FunnelWithUser;
      return steps;
    }
  };

  return (
    <Flex direction={'column'} gap={'1'}>
      <Text fontSize={'base'} lineHeight={'base'} fontWeight={'500'}>
        {details?.name}
      </Text>
      {type === WatchListItemType.FUNNELS ? (
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'400'}>
          {`${getSteps()?.[0]?.event} ➝ ${
            getSteps()?.[(getSteps() || []).length - 1]?.event
          }`}
        </Text>
      ) : null}
    </Flex>
  );
};

export default Details;
