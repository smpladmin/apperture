import { Flex, Text } from '@chakra-ui/react';
import { IntervalData } from '@lib/domain/retention';
import { capitalizeFirstLetter } from '@lib/utils/common';
import { CaretLeft, CaretRight } from 'phosphor-react';

type IntervalTabProps = {
  interval: number;
  setInterval: Function;
  intervalData: IntervalData;
  setPageNumber: Function;
  pageSize: number;
};

export const IntervalTab = ({
  interval,
  setInterval,
  intervalData,
  setPageNumber,
  pageSize,
}: IntervalTabProps) => {
  const handleClick = (index: number) => {
    setInterval(index);
  };
  return (
    <Flex
      flexDirection={'column'}
      width={'full'}
      data-testid={'retention-interval-block'}
    >
      <Flex
        flexDirection={'row'}
        borderWidth={'0 0 1px 0'}
        borderColor={'grey.400'}
        borderStyle={'solid'}
      >
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          px={2}
          borderWidth={'0 1px 0 0'}
          borderColor={'grey.400'}
          borderStyle={'solid'}
          onClick={() => {
            setPageNumber((prevPageNumber: number) =>
              prevPageNumber === 0 ? prevPageNumber : prevPageNumber - 1
            );
          }}
        >
          <CaretLeft size={16} />
        </Flex>

        <Flex w={'full'}>
          {intervalData.data.map((d, index) => {
            const intervalNumber = +d.name.split(' ')[1];
            return (
              <Flex
                flexGrow={'1'}
                key={intervalNumber}
                w={24}
                h={16}
                px={4}
                py={3}
                gap={2}
                flexDir={'column'}
                borderWidth={'0 1px 0 0'}
                borderColor={'grey.400'}
                borderStyle={'solid'}
                backgroundColor={
                  interval === intervalNumber ? 'white' : 'white.500'
                }
                onClick={() => handleClick(intervalNumber)}
                data-testid={'interval-tab'}
                cursor={'pointer'}
                borderBottom={
                  interval === intervalNumber ? 'black 3px solid' : 'none'
                }
              >
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'lh-135'}
                  fontWeight={'500'}
                  color={interval === intervalNumber ? 'black' : 'grey.500'}
                >
                  {capitalizeFirstLetter(d.name)}
                </Text>
                <Text
                  lineHeight={'lh-135'}
                  fontSize={'xs-12'}
                  fontWeight={'500'}
                  color={interval === index ? 'grey.800' : 'grey.600'}
                >
                  {d.value + '%'}
                </Text>
              </Flex>
            );
          })}
        </Flex>
        <Flex
          alignItems={'center '}
          justifyContent={'center'}
          px={2}
          borderWidth={'0 0 0 1px'}
          borderColor={'grey.400'}
          borderStyle={'solid'}
          onClick={() => {
            setPageNumber((prevPageNumber: number) =>
              intervalData.count <= (prevPageNumber + 1) * pageSize
                ? prevPageNumber
                : prevPageNumber + 1
            );
          }}
        >
          <CaretRight size={16} />
        </Flex>
      </Flex>
    </Flex>
  );
};

export default IntervalTab;
