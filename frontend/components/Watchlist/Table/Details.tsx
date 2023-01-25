import { Flex, Text } from '@chakra-ui/react';
import { Funnel } from '@lib/domain/funnel';
import { Metric } from '@lib/domain/metric';
import { Segment } from '@lib/domain/segment';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';

export const Details = ({
  info,
}: {
  info: CellContext<SavedItems, Funnel | Segment | Metric>;
}) => {
  const { type, details } = info?.row?.original;

  const getSteps = () => {
    if (type === WatchListItemType.FUNNELS) {
      const { steps } = details as Funnel;
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
