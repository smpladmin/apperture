import { Flex, Input, Text } from '@chakra-ui/react';

const PercentageMetric = () => {
  return (
    <Flex direction={'column'} gap={'1'}>
      <Text
        fontSize={'xs-10'}
        lineHeight={'xs-10'}
        color={'grey.100'}
        fontWeight={'normal'}
      >
        % Change
      </Text>
      <Input
        type={'number'}
        bg={'white.100'}
        focusBorderColor={'black.100'}
        autoFocus
      />
    </Flex>
  );
};

export default PercentageMetric;
