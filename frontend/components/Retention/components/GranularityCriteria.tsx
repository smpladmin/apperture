import { Box, Flex, Text } from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { Granularity } from '@lib/domain/retention';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { capitalizeFirstLetter } from '@lib/utils/common';
import { GREY_500, GREY_600 } from '@theme/index';
import { CaretDown, Clock } from 'phosphor-react';
import React, { useRef, useState } from 'react';

type GranularityCriteriaProps = {
  isDisabled?: boolean;
  granularity: Granularity;
  setGranularity: Function;
};

const GranularityCriteria = ({
  isDisabled = false,
  granularity,
  setGranularity,
}: GranularityCriteriaProps) => {
  const [isGranularCriterionListOpen, setIsGranularCriterionListOpen] =
    useState(false);

  const granularityCriteriaRef = useRef(null);

  useOnClickOutside(granularityCriteriaRef, () =>
    setIsGranularCriterionListOpen(false)
  );

  const handleUpdateGranularity = (selectedGranularity: string) => {
    setIsGranularCriterionListOpen(false);
    setGranularity(selectedGranularity);
  };

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
              data-testid={'granularity-list'}
              onClick={() => {
                !isDisabled && setIsGranularCriterionListOpen(true);
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
                {capitalizeFirstLetter(granularity)}
              </Text>
              <CaretDown size={14} color={GREY_500} />
            </Flex>
            <Dropdown isOpen={isGranularCriterionListOpen} width={'76'}>
              <Flex direction={'column'} minW={'10'}>
                {Object.values(Granularity).map((value) => {
                  return (
                    <Flex
                      px={'2'}
                      py={'3'}
                      key={value}
                      _hover={{
                        bg: 'white.400',
                      }}
                      data-testid={'granularity-type'}
                      onClick={() => {
                        handleUpdateGranularity(value);
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
        </Box>
      </Flex>
    </>
  );
};

export default GranularityCriteria;
