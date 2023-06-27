import { Flex, Text } from '@chakra-ui/react';
import { SavedItems } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import { CalendarBlank } from 'phosphor-react';
import { dateFormat } from '@lib/utils/common';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export const UpdatedAt = ({ info }: { info: CellContext<SavedItems, any> }) => {
  const updatedAt = info.getValue() as Date;

  return (
    <Flex gap={'2'} alignItems={'center'}>
      <CalendarBlank size={16} />
      <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'400'}>
        {`${dayjs.utc(updatedAt).local().format(dateFormat)}`}
      </Text>
    </Flex>
  );
};

export default UpdatedAt;
