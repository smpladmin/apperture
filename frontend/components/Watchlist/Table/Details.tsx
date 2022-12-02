import { Box, Flex, Text } from '@chakra-ui/react';
import Render from '@components/Render';
import { WatchListItemType } from '@lib/domain/watchlist';
import LabelType from './LabelType';

export const Details = ({ info }: { info: any }) => {
  const {
    type,
    details: { name, steps },
  } = info?.row?.original;

  return (
    <Flex direction={'column'} gap={'1'}>
      <Text fontSize={'base'} lineHeight={'base'} fontWeight={'600'}>
        {name}
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
