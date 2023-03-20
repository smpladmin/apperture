import { Box, Flex, Input, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { ConversionWindowList, ConversionWindowObj } from '@lib/domain/funnel';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { BASTILLE, GRAY_100, WHITE_DEFAULT } from '@theme/index';
import React, { useRef, useState } from 'react';

type ConversionCriteriaProps = {
  conversionWindow: ConversionWindowObj;
  setConversionWindow: Function;
  isDisabled?: boolean;
};

const ConversionCriteria = ({
  conversionWindow,
  setConversionWindow,
  isDisabled = false,
}: ConversionCriteriaProps) => {
  const [isConversionWindowListOpen, setIsConversionWindowListOpen] =
    useState(false);

  const conversionCriteriaRef = useRef(null);

  useOnClickOutside(conversionCriteriaRef, () =>
    setIsConversionWindowListOpen(false)
  );

  const handleUpdateConversionWindow = (conversionCriteria: string) => {
    setIsConversionWindowListOpen(false);
    setConversionWindow({
      type: conversionCriteria,
      value: conversionWindow.value,
    });
  };
  return (
    <>
      <Text
        fontSize={{ base: 'xs-16', md: 'sh-20' }}
        lineHeight={{ base: 'xs-16', md: 'sh-20' }}
        fontWeight={{ base: '500', md: '400' }}
        color={'white.DEFAULT'}
      >
        Conversion Time
      </Text>
      <Flex
        alignItems={'center'}
        w={'full'}
        gap={'4'}
        border={'1px'}
        borderColor={'grey.10'}
        borderRadius={12}
        px={4}
        py={5}
      >
        <i
          className="ri-time-line"
          style={{ color: GRAY_100, fontSize: 24 }}
        ></i>
        <Input
          h={10}
          w={'20'}
          border={'1px'}
          borderColor={'grey.10'}
          borderRadius={'4'}
          type={'number'}
          focusBorderColor={'white'}
          value={conversionWindow.value}
          background={'grey.100'}
          _focus={{ background: 'white' }}
          flexGrow={1}
          disabled={isDisabled}
          data-testid={'conversion-time-input'}
          onChange={(e) => {
            setConversionWindow({
              value: e.target.value || null,
              type: conversionWindow.type,
            });
          }}
        />
        <Box ref={conversionCriteriaRef} position="relative" flexGrow={1}>
          <Flex
            h={10}
            px={'3'}
            py={2}
            onClick={() => !isDisabled && setIsConversionWindowListOpen(true)}
            alignItems={'center'}
            gap={'2'}
            border={'1px'}
            data-testid={'conversion-type-list'}
            borderColor={'grey.10'}
            borderRadius={4}
            _hover={{ color: 'white', background: 'grey.300' }}
            cursor={'pointer'}
            justifyContent={'space-between'}
          >
            <Text
              color={'white.DEFAULT'}
              fontSize={{ base: 'xs-14', md: 'base' }}
              lineHeight={{ base: 'xs-16', md: 'base' }}
              fontWeight={'normal'}
              textAlign={'center'}
              data-testid={'conversion-type'}
            >
              {conversionWindow.type}
            </Text>
            <i
              className="ri-arrow-down-s-line"
              style={{ color: WHITE_DEFAULT }}
            ></i>
          </Flex>
          <Dropdown isOpen={isConversionWindowListOpen} minWidth={'40'}>
            <Flex direction={'column'} minW={'10'}>
              {Object.values(ConversionWindowList).map((value) => {
                return (
                  <Flex
                    p={'1.5'}
                    key={value}
                    _hover={{
                      bg: 'white.100',
                    }}
                    data-testid={'conversion-time-type'}
                    onClick={() => {
                      handleUpdateConversionWindow(value);
                    }}
                    cursor={'pointer'}
                  >
                    <Text
                      fontSize={{ base: 'xs-14', md: 'base' }}
                      lineHeight={{ base: 'xs-14', md: 'base' }}
                      fontWeight={'normal'}
                    >
                      {value}
                    </Text>
                  </Flex>
                );
              })}
            </Flex>
          </Dropdown>
        </Box>
      </Flex>
    </>
  );
};

export default ConversionCriteria;
