import { Box, Flex, Text } from '@chakra-ui/react';
import Render from '@components/Render';
import { ComputedFunnel } from '@lib/domain/funnel';
import { Segment } from '@lib/domain/segment';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import LabelType from './LabelType';

export const Details = ({
  info,
}: {
  info: CellContext<SavedItems, ComputedFunnel | Segment>;
}) => {
  const { type, details } = info?.row?.original;

  const getSteps = () => {
    if (type === WatchListItemType.FUNNELS) {
      const { steps } = details as ComputedFunnel;
      return steps;
    }
  };

  return (
    <Flex direction={'column'} gap={'1'}>
      <Text fontSize={'base'} lineHeight={'base'} fontWeight={'600'}>
        {details?.name}
      </Text>
      {type === WatchListItemType.FUNNELS ? (
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'400'}>
          {`${getSteps()?.[0]?.event} ➝ ${
            getSteps()?.[(getSteps() || []).length - 1]?.event
          }`}
        </Text>
      ) : null}
      <Render on={'mobile'}>
        <Box mt={'4'}>
          <LabelType type={type} />
        </Box>
      </Render>
    </Flex>
  );
};

export default Details;
