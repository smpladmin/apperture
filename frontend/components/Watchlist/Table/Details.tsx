import { Flex, Text } from '@chakra-ui/react';
import { WatchListItemType } from '@lib/domain/watchlist';

export const Details = ({ info }: { info: any }) => {
  const { type } = info?.row?.original;
  const { name, steps } = info?.getValue();

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
    </Flex>
  );
};

export default Details;
