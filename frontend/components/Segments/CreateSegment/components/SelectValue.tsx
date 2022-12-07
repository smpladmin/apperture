import { Box, CheckboxGroup, Flex, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getEventPropertiesValue } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import React, { useEffect, useRef, useState } from 'react';

const SelectValue = ({ filter }: any) => {
  const [isValueListOpen, setIsValueListOpen] = useState(true);
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);
  const [eventPropertiesValues, setEventPropertiesValues] = useState([]);

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
    <Box position={'relative'} ref={eventValueRef}>
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'600'}
        px={'2'}
        py={'2'}
        bg={'white.100'}
        cursor={'pointer'}
        onClick={() => setIsValueListOpen(true)}
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
            eventPropertiesValues.map((value: any) => (
              <Box
                key={value}
                onClick={() => {}}
                cursor={'pointer'}
                px={'2'}
                py={'3'}
                _hover={{
                  bg: 'white.100',
                }}
              >
                {value}
              </Box>
            ))
          )}
        </Box>
      ) : null}
    </Box>
  );
};

export default SelectValue;
