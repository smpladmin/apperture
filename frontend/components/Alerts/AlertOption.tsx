import { Flex, Radio, Text } from '@chakra-ui/react';

const AlertMetricOption = ({
  option,
  isChecked,
}: {
  option: any;
  isChecked: boolean;
}) => {
  return (
    <Flex
      paddingX={'3'}
      paddingY={'2'}
      cursor={'pointer'}
      bg={isChecked ? 'black.100' : 'white.DEFAULT'}
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
      <Radio value={option.name} hidden />
    </Flex>
  );
};

export default AlertMetricOption;
