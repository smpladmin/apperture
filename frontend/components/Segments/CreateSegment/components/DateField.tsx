import { Box, Button, Flex, Input, Radio, Text } from '@chakra-ui/react';
import { WhoSegmentFilter } from '@lib/domain/segment';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useRef, useState } from 'react';

type DateFieldProps = {
  filter: WhoSegmentFilter;
  updateGroupsState: Function;
};

const DateField = ({ filter, updateGroupsState }: DateFieldProps) => {
  const dateFieldRef = useRef(null);
  const [isDateFieldBoxOpen, setisDateFieldBoxOpen] = useState(false);
  const [days, setDays] = useState(false || 30);

  const closeDropdown = () => {
    setisDateFieldBoxOpen(false);
  };
  useOnClickOutside(dateFieldRef, closeDropdown);

  const handleDateChange = () => {
    closeDropdown();
  };

  return (
    <Box w={'auto'} ref={dateFieldRef} position="relative">
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'600'}
        cursor={'pointer'}
        px={'2'}
        p={'3'}
        bg={'white.100'}
        onClick={() => {
          setisDateFieldBoxOpen(true);
        }}
        data-testid={'filter-condition'}
      >
        {`Last ${days} days `}
      </Text>
      {isDateFieldBoxOpen ? (
        <Box
          position={'absolute'}
          zIndex={1}
          px={'3'}
          py={'3'}
          borderRadius={'12'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          maxH={'100'}
          overflowY={'auto'}
        >
          {
            <Flex direction={'column'} gap={'6'}>
              <Flex
                as={'label'}
                w={'14'}
                borderRadius={'100'}
                bg={'black.100'}
                px={'2'}
                py={'3'}
                cursor={'pointer'}
                data-testid={'watchlistitem'}
                justifyContent={'center'}
              >
                <Text
                  color={'white.100'}
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                >
                  {'Last'}
                </Text>
              </Flex>
              <Flex alignItems={'center'} gap={'2'}>
                <Input
                  autoFocus
                  h={'13'}
                  w={'60'}
                  focusBorderColor={'black.100'}
                  borderRadius={'4'}
                  type={'number'}
                  value={days}
                  onChange={(e) => {
                    setDays(Number(e.target.value));
                  }}
                />
                <Flex h={'13'} bg={'white.100'} alignItems={'center'} px={'4'}>
                  <Text
                    fontSize={'base'}
                    lineHeight={'base'}
                    fontWeight={'500'}
                  >
                    Days
                  </Text>
                </Flex>
              </Flex>
              <Flex gap={'2'}>
                <Button
                  h={'12'}
                  border={'1px'}
                  variant={'secondary'}
                  borderColor={'white.200'}
                  bg={'white.DEFAULT'}
                  color={'black.100'}
                  borderRadius={'8'}
                  flexGrow={'1'}
                  onClick={closeDropdown}
                >
                  Cancel
                </Button>
                <Button
                  h={'12'}
                  variant={'primary'}
                  bg={'black.100'}
                  color={'white.DEFAULT'}
                  borderRadius={'8'}
                  flexGrow={'1'}
                  onClick={handleDateChange}
                >
                  Done
                </Button>
              </Flex>
            </Flex>
          }
        </Box>
      ) : null}
    </Box>
  );
};

export default DateField;
