import { Box, Flex, Input, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { ConversionWindowList, ConversionWindowObj } from '@lib/domain/funnel';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { DEBOUNCED_WAIT_TIME, capitalizeFirstLetter } from '@lib/utils/common';
import { GREY_500, GREY_600 } from '@theme/index';
import { debounce } from 'lodash';
import { CaretDown, Clock } from 'phosphor-react';
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

  const handleChangeConversionValue = debounce((e) => {
    setConversionWindow({
      value: e.target.value || null,
      type: conversionWindow.type,
    });
  }, DEBOUNCED_WAIT_TIME);

  return (
    <>
      <Text
        pl={2}
        mt={'3'}
        color={'grey.500'}
        fontSize={{ base: 'xs-10', md: 'xs-12' }}
        lineHeight={{ base: 'xs-10', md: 'xs-12' }}
        fontWeight={'400'}
      >
        Conversion Time
      </Text>
      <Flex
        p={'3'}
        borderRadius={'8px'}
        border={'1px'}
        borderColor={'white.200'}
        justifyContent={'flex-start'}
        alignItems={'center'}
        direction={'column'}
        backgroundColor={'white.DEFAULT'}
        w={'full'}
        gap={1}
        flexDirection={'row'}
      >
        <Clock size={20} color={GREY_600} />
        <Flex
          justifyContent={'space-between'}
          alignItems={'center'}
          gap={2}
          flexGrow={1}
        >
          <Input
            w={'50%'}
            h={9}
            p={2}
            color={'black.DEFAULT'}
            fontWeight={500}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            borderRadius={'4px'}
            border={'1px'}
            borderColor={'white.200'}
            type={'number'}
            focusBorderColor={'white'}
            defaultValue={conversionWindow.value}
            background={'white.DEFAULT'}
            _focus={{ background: 'white' }}
            flexGrow={1}
            disabled={isDisabled}
            data-testid={'conversion-time-input'}
            onChange={handleChangeConversionValue}
          />
          <Box ref={conversionCriteriaRef} position="relative" w={'50%'}>
            <Flex
              w={'100%'}
              color={'black.DEFAULT'}
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={500}
              h={9}
              p={2}
              onClick={() => !isDisabled && setIsConversionWindowListOpen(true)}
              alignItems={'center'}
              gap={'2'}
              borderRadius={'4px'}
              border={'1px'}
              borderColor={'white.200'}
              data-testid={'conversion-type-list'}
              _hover={{ bg: 'white.400' }}
              cursor={'pointer'}
              justifyContent={'space-between'}
            >
              <Text
                fontSize={{ base: 'xs-14', md: 'base' }}
                lineHeight={{ base: 'xs-16', md: 'base' }}
                fontWeight={'normal'}
                textAlign={'center'}
                data-testid={'conversion-type'}
              >
                {capitalizeFirstLetter(conversionWindow.type)}
              </Text>
              <CaretDown size={14} color={GREY_500} />
            </Flex>
            <Dropdown isOpen={isConversionWindowListOpen} width={'76'}>
              <Flex direction={'column'} minW={'10'}>
                {Object.values(ConversionWindowList).map((value) => {
                  return (
                    <Flex
                      px={'2'}
                      py={'3'}
                      key={value}
                      _hover={{
                        bg: 'white.400',
                      }}
                      data-testid={'conversion-time-type'}
                      onClick={() => {
                        handleUpdateConversionWindow(value);
                      }}
                      cursor={'pointer'}
                      borderRadius={'4'}
                    >
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'lh-135'}
                        fontWeight={'500'}
                      >
                        {capitalizeFirstLetter(value)}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Dropdown>
          </Box>
        </Flex>
      </Flex>
    </>
  );
};

export default ConversionCriteria;
