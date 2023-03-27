import { Box, Flex, Text } from '@chakra-ui/react';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import { getEventPropertiesValue } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import SearchableCheckboxDropdown from '@components/SearchableDropdown/SearchableCheckboxDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { FunnelStepFilter } from '@lib/domain/funnel';
import { GREY_500, GREY_700 } from '@theme/index';
import { ArrowElbowDownRight, Trash } from 'phosphor-react';

type FilterComponentProps = {
  filter: FunnelStepFilter;
  index: number;
  handleRemoveFilter: Function;
  handleSetFilterValue: Function;
};

const FunnelStepFilter = ({
  index,
  filter,
  handleSetFilterValue,
  handleRemoveFilter,
}: FilterComponentProps) => {
  const router = useRouter();
  const { dsId } = router.query;

  const [isHovered, setIsHovered] = useState(false);
  const [valueList, setValueList] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>(
    filter.values || []
  );
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);
  const [isValueDropDownOpen, setIsValueDropDownOpen] = useState(
    filter.values.length ? false : true
  );
  const [areAllValuesSelected, setAreAllValuesSelected] =
    useState<boolean>(false);

  const eventValueRef = useRef(null);

  useEffect(() => {
    const fetchEventPropertiesValue = async () => {
      const response = await getEventPropertiesValue(
        dsId as string,
        filter.operand
      );

      // adding '(empty string)' is a workaround to handle '' string case for property values
      const transformedResponse = response.map((res: string[]) =>
        !res[0] ? '(empty string)' : res[0]
      );

      setValueList(transformedResponse);
      setLoadingPropertyValues(false);
    };
    setLoadingPropertyValues(true);
    fetchEventPropertiesValue();
  }, [filter.operand]);

  useOnClickOutside(eventValueRef, () => setIsValueDropDownOpen(false));

  const handleSubmitValues = () => {
    handleSetFilterValue(index, selectedValues);
    setIsValueDropDownOpen(false);
  };

  const handleValueSelection = (value: string[]) => {
    setAreAllValuesSelected(false);
    setSelectedValues(value);
  };

  const getValuesText = (values: string[]) => {
    if (!values.length) return 'Select value';
    if (values.length <= 2) return values.join(', ');
    return `${values[0]}, ${values[1]}, +${values.length - 2} more`;
  };

  const handleAllSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setAreAllValuesSelected(true);
      setSelectedValues([...valueList]);
    } else {
      setAreAllValuesSelected(false);
      setSelectedValues([]);
    }
  };

  return (
    <Flex
      data-testid={'event-filter'}
      width={'full'}
      mt={1}
      direction={'column'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Flex
        p={1}
        alignItems={'center'}
        gap={2}
        h={6}
        mt={2}
        pr={0}
        justifyContent={'space-between'}
      >
        <Flex alignItems={'center'}>
          <ArrowElbowDownRight size={12} color={GREY_700} weight={'bold'} />
          <Flex>
            <Flex
              alignItems={'center'}
              justifyContent={'center'}
              color={'grey.600'}
              p={1}
              height={6}
              data-testid={'filter-condition'}
              cursor={'pointer'}
              borderRadius={'4px'}
              _hover={{ color: 'grey.800', background: 'white.400' }}
            >
              <Text
                color={'inherit'}
                fontSize={'xs-12'}
                lineHeight={'lh-120'}
                fontWeight={'400'}
              >
                {filter.condition}
              </Text>
            </Flex>
            <Box
              p={1}
              borderBottom={'1px'}
              borderStyle={'dashed'}
              borderColor={'black.500'}
            >
              <Text fontSize={'xs-12'} lineHeight={'xs-14'} color={'black.500'}>
                {filter.operand}
              </Text>
            </Box>
          </Flex>
        </Flex>
        <Flex
          data-testid={'remove-filter'}
          fontWeight={'500'}
          color={'grey.200'}
          cursor={'pointer'}
          opacity={isHovered ? 1 : 0}
          onClick={() => handleRemoveFilter(index)}
        >
          <Trash size={14} color={GREY_500} />
        </Flex>
      </Flex>
      <Flex width={'full'} justifyContent={'space-between'}>
        <Flex
          fontSize={'xs-12'}
          lineHeight={'xs-14'}
          color={'white'}
          fontWeight={500}
          marginLeft={6}
          position="relative"
          cursor={'pointer'}
          p={1}
          borderRadius={4}
          _hover={{ color: 'white', background: 'grey.300' }}
          width={'max-content'}
        ></Flex>
      </Flex>
      <Flex marginLeft={6} gap={2}>
        <Flex
          alignItems={'center'}
          justifyContent={'center'}
          color={'grey.600'}
          p={1}
          height={6}
          data-testid={'filter-operator'}
          cursor={'not-allowed'}
          borderRadius={'4px'}
          _hover={{ color: 'grey.800', background: 'white.400' }}
        >
          <Text
            color={'inherit'}
            fontSize={'xs-12'}
            lineHeight={'lh-120'}
            fontWeight={'400'}
          >
            {filter.operator}
          </Text>
        </Flex>
        <Box position={'relative'} ref={eventValueRef}>
          <Box
            p={1}
            borderBottom={'1px'}
            borderStyle={'dashed'}
            borderColor={'black.500'}
            onClick={() => {
              setIsValueDropDownOpen(true);
            }}
          >
            <Text
              data-testid={'event-filter-values'}
              cursor={'pointer'}
              fontSize={'xs-12'}
              lineHeight={'xs-14'}
              color={'black.500'}
              wordBreak={'break-word'}
            >
              {getValuesText(filter.values)}
            </Text>
          </Box>
          <SearchableCheckboxDropdown
            isOpen={isValueDropDownOpen}
            isLoading={loadingPropertyValues}
            data={valueList}
            onSubmit={handleSubmitValues}
            onAllSelect={handleAllSelect}
            onSelect={handleValueSelection}
            isSelectAllChecked={areAllValuesSelected}
            selectedValues={selectedValues}
            width={'96'}
            placeholderText={'Search for properties...'}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default FunnelStepFilter;
