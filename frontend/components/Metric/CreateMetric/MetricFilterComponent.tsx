import { Box, Flex, Text } from '@chakra-ui/react';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import indent from '@assets/icons/indent.svg';
import Image from 'next/image';
import { getEventPropertiesValue } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import SearchableCheckboxDropdown from '@components/SearchableDropdown/SearchableCheckboxDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';

type MetricFilterComponentProps = {
  condition: string;
  operator: string;
  operand: string;
  values: string[];
  index: number;
  handleSetCondition: Function;
  handleSetFilter: Function;
};

const MetricFilterComponent = ({
  condition,
  operator,
  operand,
  values,
  index,
  handleSetCondition,
  handleSetFilter,
}: MetricFilterComponentProps) => {
  const router = useRouter();
  const { dsId } = router.query;
  const [valueList, setValueList] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>(values || []);
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);
  const [isValueDropDownOpen, setIsValueDropDownOpen] = useState(false);
  const [areAllValuesSelected, setAreAllValuesSelected] =
    useState<boolean>(false);

  const eventValueRef = useRef(null);

  useEffect(() => {
    const fetchEventPropertiesValue = async () => {
      const response = await getEventPropertiesValue(dsId as string, operand);

      // adding '(empty string)' is a workaround to handle '' string case for property values
      const transformedResponse = response.map((res: string[]) =>
        !res[0] ? '(empty string)' : res[0]
      );

      setValueList(transformedResponse);
      setLoadingPropertyValues(false);
    };
    setLoadingPropertyValues(true);
    fetchEventPropertiesValue();
  }, [operand]);

  useOnClickOutside(eventValueRef, () => setIsValueDropDownOpen(false));

  const handleSubmitValues = () => {
    handleSetFilter(index, { values: selectedValues });
    setIsValueDropDownOpen(false);
  };

  const handleValueSelection = (value: string[]) => {
    setAreAllValuesSelected(false);
    setSelectedValues(value);
  };
  const getValuesText = (values: string[]) => {
    if (!values.length) return 'Select value';
    if (values.length <= 2) return values.join(', ');
    return `${values[0]}, ${values[1]} or ${values.length - 2} more`;
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
      width={'full'}
      _first={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
      m={2}
      py={2}
      px={5}
      direction={'column'}
      gap={1}
    >
      <Text fontSize={'xs-12'} lineHeight={'xs-14'} color={'grey.100'}>
        {condition}
      </Text>
      <Text
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
      >
        <Box position={'absolute'} left={-6}>
          <Image src={indent} />
        </Box>
        {operand}
      </Text>
      <Flex marginLeft={6} gap={2}>
        <Text
          fontSize={'xs-12'}
          p={1}
          lineHeight={'xs-14'}
          cursor={'pointer'}
          borderRadius={4}
          color={'grey.100'}
          _hover={{ color: 'white', background: 'grey.300' }}
        >
          {operator}
        </Text>
        <Box position={'relative'} ref={eventValueRef}>
          <Text
            p={1}
            fontSize={'xs-12'}
            borderRadius={4}
            lineHeight={'xs-14'}
            cursor={'pointer'}
            color={'white'}
            _hover={{ color: 'white', background: 'grey.300' }}
            onClick={() => {
              setIsValueDropDownOpen((prevState) => !prevState);
            }}
          >
            {getValuesText(values)}
          </Text>
          <SearchableCheckboxDropdown
            isOpen={isValueDropDownOpen}
            isLoading={loadingPropertyValues}
            data={valueList}
            onSubmit={handleSubmitValues}
            onAllSelect={handleAllSelect}
            onSelect={handleValueSelection}
            isSelectAllChecked={areAllValuesSelected}
            selectedValues={selectedValues}
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default MetricFilterComponent;
