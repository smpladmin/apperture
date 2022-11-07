import { Flex, Radio, Text } from '@chakra-ui/react';

type AlertMetricOptionProps = {
  option: {
    name: string;
    label: string;
    isDisabled: boolean;
  };
  isChecked: boolean;
};

const AlertMetricOption = ({ option, isChecked }: AlertMetricOptionProps) => {
  return (
    <Flex
      paddingX={{ base: '3', md: '6' }}
      paddingY={{ base: '2', md: '3' }}
      cursor={'pointer'}
      pointerEvents={option.isDisabled ? 'none' : 'all'}
      bg={
        isChecked
          ? 'black.100'
          : option.isDisabled
          ? 'grey.DEFAULT'
          : 'white.DEFAULT'
      }
      border={'1px'}
      borderColor={isChecked ? 'black.100' : 'white.200'}
      borderRadius={'25'}
      alignItems={'center'}
      as={'label'}
    >
      <Text
        fontSize={{ base: 'xs-12', md: 'xs-14' }}
        lineHeight={{ base: 'xs-12', md: 'xs-14' }}
        fontWeight={isChecked ? 'medium' : 'normal'}
        color={isChecked ? 'white.DEFAULT' : 'black.100'}
      >
        {option.label}
      </Text>
      <Radio value={option.name} hidden disabled={option.isDisabled} />
    </Flex>
  );
};

export default AlertMetricOption;
