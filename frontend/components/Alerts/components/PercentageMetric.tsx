import {
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Text,
} from '@chakra-ui/react';

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
      <InputGroup>
        <Input
          autoFocus
          type={'number'}
          bg={'white.100'}
          height={{ base: '10', md: '13' }}
          focusBorderColor={'black.100'}
          value={percentageValue}
          onChange={(e) => setPercentageValue(e.target.value)}
          placeholder={'Enter % change'}
        />
        <InputRightElement
          pointerEvents="none"
          height={{ base: '10', md: '13' }}
        >
          {'%'}
        </InputRightElement>
      </InputGroup>
    </Flex>
  );
};

export default PercentageMetric;
