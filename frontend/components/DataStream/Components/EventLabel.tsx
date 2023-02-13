import { Flex, IconButton, Text } from '@chakra-ui/react';
import { useState } from 'react';

export const formateventLabel = (label: string) => {
  if (label == '$pageview') return ['ri-eye-fill', 'Pageview'];
  if (label == '$pageleave') return ['ri-delete-back-2-fill', 'Pageleave'];
  if (label == '$autocapture') return ['ri-cursor-fill', 'Autocapture'];
  return ['ri-edit-box-fill', 'Precision'];
};

const EventLabel = ({ event }: { event: string }) => {
  const [data, setData] = useState(formateventLabel(event));
  return (
    <Flex alignContent={'center'} alignItems={'center'}>
      <IconButton
        bg={'none'}
        p={0}
        px={1}
        size={'small'}
        aria-label="event"
        _hover={{}}
        icon={<i style={{ fontSize: 'xs-8' }} className={data[0]}></i>}
      />
      <Text
        data-testid="event-cell"
        fontWeight={500}
        fontSize={'xs-12'}
        lineHeight={'xs-16'}
      >
        {data[1]}
      </Text>
    </Flex>
  );
};

export default EventLabel;
