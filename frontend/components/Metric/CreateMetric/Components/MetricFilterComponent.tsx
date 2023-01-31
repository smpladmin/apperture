import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import indent from '@assets/icons/indent.svg';
import Image from 'next/image';
import { getEventPropertiesValue } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import SearchableCheckboxDropdown from '@components/SearchableDropdown/SearchableCheckboxDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';

type MetricFilterComponentProps = {
  condition: string;
  operator: string;
  operand: string;
  values: string[];
  index: number;
  handleSetCondition: Function;
  handleSetFilter: Function;
  removeFilter: Function;
  eventProperties: string[];
  loadingEventProperties: boolean;
};

const MetricFilterComponent = ({
  condition,
  operator,
  operand,
  values,
  index,
  handleSetCondition,
  handleSetFilter,
  removeFilter,
  eventProperties,
  loadingEventProperties,
}: MetricFilterComponentProps) => {
  const router = useRouter();
  const { dsId } = router.query;
  const [isHovered, setIsHovered] = useState(false);
  const [valueList, setValueList] = useState<string[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>(values || []);
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);
  const [isValueDropDownOpen, setIsValueDropDownOpen] = useState(false);
  const [areAllValuesSelected, setAreAllValuesSelected] =
    useState<boolean>(false);
  const [openEventDropdown, setOpenEventDropdown] = useState(false);

  const eventValueRef = useRef(null);
  const eventRef = useRef(null);

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
  useOnClickOutside(eventRef, () => setOpenEventDropdown(false));

  const handleSubmitValues = () => {
    handleSetFilter(index, { values: selectedValues });
    setIsValueDropDownOpen(false);
  };
  const handleSubmitEvent = (value: string) => {
    handleSetFilter(index, { operand: value });
    setOpenEventDropdown(false);
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

  const handleRemoveComponent = () => {
    removeFilter(index);
  };

  return (
    <Flex
      data-testid={'event-filter-component'}
      width={'full'}
      _first={{ borderTop: '1px solid rgba(255, 255, 255, 0.2)' }}
      marginTop={2}
      px={5}
      direction={'column'}
      gap={1}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Text fontSize={'xs-12'} lineHeight={'xs-14'} color={'grey.100'}>
        {condition}
      </Text>
      <Flex
        width={'full'}
        justifyContent={'space-between'}
        position="relative"
        ref={eventRef}
      >
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
          onClick={() => setOpenEventDropdown(true)}
        >
          <Box position={'absolute'} left={-6}>
            <Image src={indent} alt={'indent'} />
          </Box>
          {operand}
        </Flex>
        <SearchableListDropdown
          isOpen={openEventDropdown}
          isLoading={loadingEventProperties}
          data={eventProperties}
          onSubmit={handleSubmitEvent}
        />
        <IconButton
          size={'xs'}
          fontWeight={'500'}
          aria-label="set alerts"
          variant={'iconButton'}
          icon={<i className="ri-close-fill"></i>}
          color={'grey.200'}
          opacity={isHovered ? 1 : 0}
          _hover={{ color: 'white', background: 'grey.300' }}
          onClick={handleRemoveComponent}
        />
      </Flex>
      <Flex marginLeft={6} gap={2}>
        <Text
          fontSize={'xs-12'}
          p={1}
          lineHeight={'xs-14'}
          cursor={'not-allowed'}
          borderRadius={4}
          color={'grey.100'}
          height={'max-content'}
          _hover={{ color: 'white', background: 'grey.300' }}
        >
          {operator}
        </Text>
        <Box position={'relative'} ref={eventValueRef}>
          <Text
            data-testid={'event-filter-values'}
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
            wordBreak={'break-all'}
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
