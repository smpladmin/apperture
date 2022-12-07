import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Text,
} from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getEventPropertiesValue } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

const SelectValue = ({ filter }: any) => {
  const [isValueListOpen, setIsValueListOpen] = useState(true);
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);
  const [eventPropertiesValues, setEventPropertiesValues] = useState([]);
  const [filterValues, setFilterValues] = useState<any[]>([]);

  const router = useRouter();
  const { dsId } = router.query;

  const eventValueRef = useRef(null);
  useOnClickOutside(eventValueRef, () => setIsValueListOpen(false));

  useEffect(() => {
    const fetchEventPropertiesValue = async () => {
      const res = await getEventPropertiesValue(dsId as string, filter.operand);
      setEventPropertiesValues(res);
      setLoadingPropertyValues(false);
    };
    setLoadingPropertyValues(true);
    fetchEventPropertiesValue();
  }, []);

  return (
    <Box
      position={'relative'}
      ref={eventValueRef}
      onClick={() => setIsValueListOpen(true)}
    >
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'600'}
        px={'2'}
        py={'2'}
        bg={'white.100'}
        cursor={'pointer'}
      >
        {filter.value || 'Select Value...'}
      </Text>
      {isValueListOpen ? (
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
          {loadingPropertyValues ? (
            <Flex
              w={'80'}
              h={'80'}
              alignItems={'center'}
              justifyContent={'center'}
            >
              <LoadingSpinner />
            </Flex>
          ) : (
            <Flex direction={'column'}>
              <Box overflowY={'auto'}>
                <CheckboxGroup
                  value={filterValues}
                  onChange={(values) => {
                    setFilterValues(values);
                  }}
                >
                  {eventPropertiesValues.map((value: any, i) => {
                    return (
                      <Flex
                        as={'label'}
                        gap={'3'}
                        py={'4'}
                        px={'3'}
                        key={value[0]}
                      >
                        <Checkbox colorScheme={'radioBlack'} value={value[0]}>
                          <Text
                            fontSize={{ base: 'xs-12', md: 'xs-14' }}
                            lineHeight={{ base: 'xs-12', md: 'xs-14' }}
                            fontWeight={'medium'}
                            cursor={'pointer'}
                          >
                            {value[0] || '(empty string)'}
                          </Text>
                        </Checkbox>
                      </Flex>
                    );
                  })}
                </CheckboxGroup>
              </Box>
              <Button w="full">Add</Button>
            </Flex>
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default SelectValue;
