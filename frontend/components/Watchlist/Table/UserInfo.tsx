import { Avatar, Flex, Text } from '@chakra-ui/react';
import { AppertureUser } from '@lib/domain/user';
import { SavedItems } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';

export const UserInfo = ({
  info,
}: {
  info: CellContext<SavedItems, AppertureUser>;
}) => {
  const { firstName, lastName, picture } = info.getValue();

  return (
    <Flex gap={'2'} alignItems={'center'}>
      <Avatar name={`${firstName} ${lastName}`} src={picture} size={'2xs'} />
      <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'400'}>
        {`${firstName} ${lastName}`}
      </Text>
    </Flex>
  );
};

export default UserInfo;
