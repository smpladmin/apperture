import { Avatar, Flex, Text } from '@chakra-ui/react';
import { AppertureUser } from '@lib/domain/user';
import { SavedItems } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import { User } from 'phosphor-react';

export const UserInfo = ({
  info,
}: {
  info: CellContext<SavedItems, AppertureUser>;
}) => {
  const { firstName, lastName, picture } = info.getValue();

  return (
    <Flex gap={'2'} alignItems={'center'}>
      <User size={16} />
      <Text fontSize={'xs-12'} lineHeight={'xs-12'} fontWeight={'400'}>
        {`${firstName} ${lastName}`}
      </Text>
    </Flex>
  );
};

export default UserInfo;
