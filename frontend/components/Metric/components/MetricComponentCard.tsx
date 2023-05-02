import { Box, Flex, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import React, { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import {
  MetricAggregate,
  MetricBasicAggregation,
  MetricVariant,
} from '@lib/domain/metric';
import { Node } from '@lib/domain/node';

import {
  FilterConditions,
  FilterDataType,
  FilterOperatorsDatatypeMap,
  FilterOperatorsString,
  FilterType,
  ISFilterOperators,
  WhereFilter,
} from '@lib/domain/common';
import MetricAggregation from './MetricAggregation';
import StepFilter from '@components/StepFilters/StepFilters';
import AddFilterComponent from '@components/StepFilters/components/AddFilter';
import { Trash } from 'phosphor-react';
import {
  COLOR_PALLETE_5,
  hasValidFilters,
  useColorFromPallete,
} from '@components/Metric/util';
import { GREY_500 } from '@theme/index';
import SelectEventOrSegmentDropdown from './SelectEventOrSegmentDropdown';

type MetricComponentCardProps = {
  index: number;
  variable: string;
  eventList: Node[];
  eventProperties: string[];
  updateAggregate: Function;
  removeAggregate: Function;
  aggregate: MetricAggregate;
  loadingEventsAndProperties: boolean;
  metricDefinition: string;
  breakdown: string[];
};

const MetricComponentCard = ({
  index,
  variable,
  eventList,
  eventProperties,
  loadingEventsAndProperties,
  updateAggregate,
  removeAggregate,
  aggregate,
  metricDefinition,
  breakdown,
}: MetricComponentCardProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [variant, setVariant] = useState<MetricVariant>(
    aggregate?.variant || MetricVariant.UNDEFINED
  );
  const [isEventOrSegmentListOpen, setIsEventOrSegmentListOpen] =
    useState<boolean>(aggregate?.reference_id ? false : true);

  const [isEventOrSegmentListLoading, setIsEventOrSegmentListLoading] =
    useState<boolean>(false);
  const [eventOrSegmentListSearchData, setEventOrSegmentListSearchData] =
    useState<Node[]>([]);
  const [reference, setReference] = useState(aggregate?.reference_id || '');
  const [filters, setFilters] = useState<WhereFilter[]>(
    aggregate?.filters || []
  );
  const previousVariant = useRef<MetricVariant | null>(null);

  const EventOrSegmentBox = useRef(null);
  useOnClickOutside(EventOrSegmentBox, () => {
    if (reference == '') {
      setVariant(MetricVariant.UNDEFINED);
    }
    setIsEventOrSegmentListOpen(false);
  });

  const handleEventOrSegmentSelection = (selection: Node) => {
    setIsEventOrSegmentListOpen(false);
    updateAggregate(variable, {
      reference_id: selection.id,
      aggregations: {
        property: '',
        functions: MetricBasicAggregation.TOTAL,
      },
    });
    setReference(selection.id);
  };

  const handleAddFilter = (value: string) => {
    const getFilterCondition = (filters: WhereFilter[]) => {
      return !filters.length ? FilterConditions.WHERE : FilterConditions.AND;
    };

    const newFilter = {
      condition: getFilterCondition(filters),
      operand: value,
      operator: FilterOperatorsString.IS,
      values: [],
      type: FilterType.WHERE,
      all: false,
      datatype: FilterDataType.STRING,
    };

    setFilters([...filters, newFilter]);
  };

  const handleSetFilterValue = (filterIndex: number, values: string[]) => {
    let stepFilters = [...filters];
    stepFilters[filterIndex]['values'] = values;

    setFilters(stepFilters);
  };

  const handleSetFilterPropertyValue = (
    filterIndex: number,
    property: string
  ) => {
    let stepFilters = [...filters];
    stepFilters[filterIndex]['operand'] = property;

    setFilters(stepFilters);
  };

  const handleRemoveComponent = () => {
    removeAggregate(index);
  };

  const removeFilter = (filterIndex: number) => {
    let stepFilters = [...filters];
    stepFilters.splice(filterIndex, 1);

    if (filterIndex === 0 && stepFilters.length)
      stepFilters[0]['condition'] = FilterConditions.WHERE;

    setFilters(stepFilters);
  };

  const handleFilterDatatypeChange = (
    filterIndex: number,
    selectedDatatype: FilterDataType
  ) => {
    let stepFilters = [...filters];
    stepFilters[filterIndex]['operator'] =
      FilterOperatorsDatatypeMap[selectedDatatype][0];
    stepFilters[filterIndex]['values'] = [];
    stepFilters[filterIndex]['datatype'] = selectedDatatype;

    setFilters(stepFilters);
  };

  const handleOperatorChange = (filterIndex: number, selectedOperator: any) => {
    let stepFilters = [...filters];

    if (stepFilters[filterIndex].datatype === FilterDataType.STRING) {
      const isMatchingFilter =
        ISFilterOperators.includes(
          stepFilters[filterIndex].operator as FilterOperatorsString
        ) ===
        ISFilterOperators.includes(selectedOperator as FilterOperatorsString);

      if (!isMatchingFilter) {
        stepFilters[index].values = [];
      }
    }

    stepFilters[filterIndex].operator = selectedOperator;
    setFilters(stepFilters);
  };

  const handleVariantSelection = (variant: MetricVariant) => {
    setVariant(variant);
  };

  useEffect(() => {
    if (variant !== previousVariant.current) {
      previousVariant.current = variant;
      updateAggregate(variable, { variant });
      setIsEventOrSegmentListLoading(true);
    }
    if (variant === MetricVariant.EVENT) {
      setEventOrSegmentListSearchData(eventList);
      setIsEventOrSegmentListLoading(false);
    }
  }, [variant, eventList]);

  useEffect(() => {
    if (hasValidFilters(filters)) {
      updateAggregate(variable, { filters });
    }
  }, [filters]);

  useEffect(() => {
    setReference(aggregate?.reference_id);
    setFilters(aggregate?.filters);
    setVariant(aggregate?.variant);
  }, [aggregate]);

  return (
    <Flex
      data-testid="event-or-segment-component"
      direction={'column'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      borderColor={isHovered ? 'grey.700' : 'white.200'}
      borderRadius={'8'}
      borderStyle={'solid'}
      borderWidth={'1px'}
      p={3}
      gap={'2'}
    >
      <Flex gap={'2'} width={'full'} alignItems={'center'}>
        <Flex
          data-testid="event-or-segment-component-variable"
          background={
            useColorFromPallete(metricDefinition, breakdown)
              ? COLOR_PALLETE_5[index].hexaValue
              : 'white.200'
          }
          borderRadius={'4'}
          textAlign="center"
          fontWeight={500}
          color={
            useColorFromPallete(metricDefinition, breakdown)
              ? 'white.DEFAULT'
              : 'grey.500'
          }
          fontSize={'xs-10'}
          lineHeight={'12px'}
          justifyContent={'center'}
          alignItems={'center'}
          height={'5'}
          width={'5'}
        >
          {variable}
        </Flex>
        <Flex
          grow={1}
          cursor={'pointer'}
          color={'black'}
          _hover={{ background: 'white.400' }}
          borderRadius={'4'}
          data-testid="select-event-segment"
          onClick={() => setIsEventOrSegmentListOpen(true)}
        >
          <Box position="relative" ref={EventOrSegmentBox}>
            <Text
              data-testid={'event-or-segment-name'}
              color={reference ? 'black.DEFAULT' : 'grey.600'}
              fontSize={'xs-14'}
              fontWeight={500}
              lineHeight={'xs-18'}
              p={'1'}
              wordBreak={'break-all'}
            >
              {reference === '' ? 'Select Event' : reference}
            </Text>
            {variant === MetricVariant.UNDEFINED ? (
              <SelectEventOrSegmentDropdown
                isOpen={isEventOrSegmentListOpen}
                onSelect={handleVariantSelection}
              />
            ) : variant === 'event' ? (
              <SearchableListDropdown
                isOpen={isEventOrSegmentListOpen}
                isLoading={isEventOrSegmentListLoading}
                data={eventOrSegmentListSearchData}
                onSubmit={handleEventOrSegmentSelection}
                listKey={'id'}
                isNode
                width={'96'}
              />
            ) : null}
          </Box>
        </Flex>
        <Box
          onClick={handleRemoveComponent}
          opacity={isHovered ? 1 : 0}
          cursor={'pointer'}
          data-testid={'remove-aggregate'}
        >
          <Trash size={14} color={GREY_500} />
        </Box>
      </Flex>

      {reference && (
        <>
          <MetricAggregation
            aggregate={aggregate}
            updateAggregate={updateAggregate}
            eventProperties={eventProperties}
            loadingEventsAndProperties={loadingEventsAndProperties}
          />

          {Boolean(filters.length) && (
            <Flex direction={'column'} gap={'2'}>
              {filters.map((filter, index) => (
                <Flex key={index} direction={'column'} gap={'2'}>
                  <StepFilter
                    index={index}
                    filter={filter}
                    eventProperties={eventProperties}
                    loadingEventProperties={loadingEventsAndProperties}
                    handleSetFilterProperty={handleSetFilterPropertyValue}
                    handleSetFilterValue={handleSetFilterValue}
                    handleRemoveFilter={removeFilter}
                    handleFilterDatatypeChange={handleFilterDatatypeChange}
                    handleOperatorChange={handleOperatorChange}
                  />
                </Flex>
              ))}
            </Flex>
          )}
          <AddFilterComponent
            filters={filters}
            eventProperties={eventProperties}
            handleAddFilter={handleAddFilter}
            loadingEventProperties={loadingEventsAndProperties}
            hideIndentIcon
          />
        </>
      )}
    </Flex>
  );
};

export default MetricComponentCard;
