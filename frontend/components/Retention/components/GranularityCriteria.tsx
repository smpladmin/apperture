import { Box, Flex, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { ConversionWindowList, ConversionWindowObj } from '@lib/domain/funnel';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { capitalizeFirstLetter } from '@lib/utils/common';
import { GREY_500, GREY_600 } from '@theme/index';
import { CaretDown, Clock } from 'phosphor-react';
import React, { useRef, useState } from 'react';

type GranularityCriteriaProps = {
  // conversionWindow: ConversionWindowObj;
  // setConversionWindow: Function;
  isDisabled?: boolean;
};

const GranularityCriteria = ({
  // conversionWindow,
  // setConversionWindow,
  isDisabled = false,
}: GranularityCriteriaProps) => {
  const [isGranularCriterionListOpen, setisGranularCriterionListOpen] =
    useState(false);

  const granularityCriteriaRef = useRef(null);

  useOnClickOutside(granularityCriteriaRef, () =>
    setisGranularCriterionListOpen(false)
  );

  return (
    <>
      <Flex
        alignItems={'center'}
        gap={1}
        justifyContent={'space-between'}
        width={'full'}
      >
        <Clock size={20} color={GREY_600} />
        <Box flexGrow={1}>
          <Box ref={granularityCriteriaRef} position="relative">
            <Flex
              w={'100%'}
              h={9}
              p={2}
              onClick={() => {
                !isDisabled && setisGranularCriterionListOpen(true);
              }}
              alignItems={'center'}
              borderRadius={'4px'}
              border={'0px'}
              _hover={{ bg: 'white.400' }}
              cursor={'pointer'}
              justifyContent={'space-between'}
            >
              <Text
                color={'black.DEFAULT'}
                fontSize={'xs-14'}
                lineHeight={'lh-130'}
                fontWeight={500}
                textAlign={'center'}
              >
                {/* {capitalizeFirstLetter(conversionWindow.type)} */} Day
              </Text>
              <CaretDown size={14} color={GREY_500} />
            </Flex>
            <Dropdown isOpen={isGranularCriterionListOpen} width={'76'}>
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
                      onClick={() => {}}
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
        </Box>
      </Flex>
    </>
  );
};

export default GranularityCriteria;
