import { Box, Flex, Text } from '@chakra-ui/react';
import Render from '@components/Render';
import { ComputedFunnel } from '@lib/domain/funnel';
import { Notifications } from '@lib/domain/notification';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import LabelType from './LabelType';

export const Details = ({
  info,
}: {
  info: CellContext<SavedItems, ComputedFunnel | Notifications>;
}) => {
  const { type, details } = info?.row?.original;

  /*Temporary change - look for a better alternative for such usecase */
  const { steps } = details as ComputedFunnel;

  return (
    <Flex direction={'column'} gap={'1'}>
      <Text fontSize={'base'} lineHeight={'base'} fontWeight={'600'}>
        {details?.name}
      </Text>
      {type === WatchListItemType.FUNNELS ? (
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'400'}>
          {`${steps?.[0]?.event} -> ${steps?.[steps.length - 1]?.event}`}
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
