import { Flex, Radio, Text } from '@chakra-ui/react';

const WatchListItemOptions = ({ watchListItem, isSelected }: any) => {
  return (
    <Flex
      as={'label'}
      borderRadius={'100'}
      bg={'white.DEFAULT'}
      px={'6'}
      py={'2'}
      border={'1px'}
      borderColor={isSelected ? 'black.100' : 'white.200'}
      cursor={'pointer'}
    >
      <Text
        fontSize={{ base: 'xs-12', md: 'xs-14' }}
        lineHeight={{ base: 'xs-12', md: 'xs-14' }}
        fontWeight={'500'}
      >
        {watchListItem.label}
      </Text>
      <Radio value={watchListItem.id} hidden />
    </Flex>
  );
};

export default WatchListItemOptions;
