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
      paddingX={'3'}
      paddingY={'2'}
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
        fontSize={'xs-12'}
        fontWeight={isChecked ? 'medium' : 'normal'}
        color={isChecked ? 'white.DEFAULT' : 'black.100'}
        lineHeight={'xs-12'}
      >
        {option.label}
      </Text>
      <Radio value={option.name} hidden disabled={option.isDisabled} />
    </Flex>
  );
};

export default AlertMetricOption;
