import { Flex, Input, Text } from '@chakra-ui/react';

type PercentageMetricProps = {
  percentageValue: number | string;
  setPercentageValue: Function;
};

const PercentageMetric = ({
  percentageValue,
  setPercentageValue,
}: PercentageMetricProps) => {
  return (
    <Flex direction={'column'} gap={'1'}>
      <Text
        fontSize={{ base: 'xs-10', md: 'xs-14' }}
        lineHeight={{ base: 'xs-10', md: 'xs-14' }}
        color={'grey.100'}
        fontWeight={'normal'}
      >
        % Change
      </Text>
      <Input
        autoFocus
        type={'number'}
        bg={'white.100'}
        height={{ base: '9', md: '14' }}
        focusBorderColor={'black.100'}
        value={percentageValue}
        onChange={(e) => setPercentageValue(e.target.value)}
      />
    </Flex>
  );
};

export default PercentageMetric;
