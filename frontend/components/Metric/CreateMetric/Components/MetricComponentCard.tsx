import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import React, { Fragment, useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import {
  MetricAggregate,
  MetricBasicAggregation,
  MetricComponentVariant,
} from '@lib/domain/metric';
import { Node } from '@lib/domain/node';

import {
  FilterConditions,
  FilterDataType,
  FilterOperatorsString,
  FilterType,
  WhereFilter,
} from '@lib/domain/common';
import MetricAggregation from './MetricAggregation';
import StepFilter from '@components/StepFilters/StepFilters';
import AddFilterComponent from '@components/StepFilters/AddFilter';
import { Trash } from 'phosphor-react';

type MetricComponentCardProps = {
  index: number;
  variable: string;
  eventList: Node[];
  eventProperties: string[];
  updateAggregate: Function;
  removeAggregate: Function;
  savedAggregate: MetricAggregate;
  loadingEventsAndProperties: boolean;
};

const MetricComponentCard = ({
  index,
  variable,
  eventList,
  eventProperties,
  loadingEventsAndProperties,
  updateAggregate,
  removeAggregate,
  savedAggregate,
}: MetricComponentCardProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [variant, setVariant] = useState<MetricComponentVariant>(
    savedAggregate?.variant || MetricComponentVariant.UNDEFINED
  );
  const [isEventOrSegmentListOpen, setIsEventOrSegmentListOpen] =
    useState<boolean>(false);
  const [isEventOrSegmentListLoading, setIsEventOrSegmentListLoading] =
    useState<boolean>(false);
  const [eventOrSegmentListSearchData, setEventOrSegmentListSearchData] =
    useState<Node[]>([]);
  const [reference, setReference] = useState(
    savedAggregate?.reference_id || ''
  );
  const [filters, setFilters] = useState<WhereFilter[]>(
    savedAggregate?.filters || []
  );
  const previousVariant = useRef<MetricComponentVariant | null>(null);

  const EventOrSegmentBox = useRef(null);
  useOnClickOutside(EventOrSegmentBox, () => {
    if (reference == '') {
      setVariant(MetricComponentVariant.UNDEFINED);
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
    let tempFilters = [...filters];
    tempFilters.splice(filterIndex, 1);

    if (filterIndex === 0 && tempFilters.length)
      tempFilters[0]['condition'] = FilterConditions.WHERE;

    setFilters(tempFilters);
  };

  useEffect(() => {
    if (variant !== previousVariant.current) {
      previousVariant.current = variant;
      updateAggregate(variable, { variant });
      setIsEventOrSegmentListLoading(true);
    }
    if (variant === MetricComponentVariant.EVENT) {
      setEventOrSegmentListSearchData(eventList);
      setIsEventOrSegmentListLoading(false);
    }
  }, [variant, eventList]);

  useEffect(() => {
    if (filters.every((filter) => filter.values.length)) {
      updateAggregate(variable, { filters });
    }
  }, [filters]);

  useEffect(() => {
    setReference(savedAggregate?.reference_id);
    setFilters(savedAggregate?.filters);
    setVariant(savedAggregate?.variant);
  }, [savedAggregate]);

  return (
    <Flex
      data-testid="event-or-segment-component"
      justifyContent={'space-between'}
      alignItems={'center'}
      direction={'column'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      borderColor={'white.200'}
      borderRadius={'8'}
      borderStyle={'solid'}
      borderWidth={'1px'}
      mb={3}
    >
      <Flex p={3} gap={'2'} width={'full'} alignItems={'center'}>
        <Flex
          data-testid="event-or-segment-component-variable"
          background={'white.200'}
          borderRadius={'4'}
          textAlign="center"
          fontWeight={500}
          color={'grey.500'}
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
          mx={1}
          cursor={'pointer'}
          color={'black'}
          _hover={{ background: 'white.200' }}
          data-testid="select-event-segment"
          onClick={() => setIsEventOrSegmentListOpen((prevState) => !prevState)}
        >
          <Box position="relative" ref={EventOrSegmentBox}>
            <Text
              data-testid={'event-or-segment-name'}
              color={'black'}
              fontSize={'xs-14'}
              fontWeight={500}
              lineHeight={'xs-18'}
              wordBreak={'break-all'}
            >
              {reference === '' ? 'Add Event / Segment' : reference}
            </Text>
            {isEventOrSegmentListOpen ? (
              variant === MetricComponentVariant.UNDEFINED ? (
                <Flex
                  background={'white'}
                  direction={'column'}
                  gap={1}
                  position="absolute"
                  p={2}
                  borderRadius={12}
                  zIndex={'10'}
                >
                  <Flex
                    data-testid={'event-option'}
                    lineHeight={'xs-18'}
                    color={'black'}
                    fontSize={'xs-14'}
                    fontWeight={500}
                    width={'full'}
                    p={2}
                    borderRadius={8}
                    _hover={{
                      background: 'white.100',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setVariant(MetricComponentVariant.EVENT);
                    }}
                  >
                    <Text marginLeft={2}>Events</Text>
                  </Flex>
                  <Flex
                    lineHeight={'xs-18'}
                    color={'black'}
                    fontSize={'xs-14'}
                    fontWeight={500}
                    width={'full'}
                    p={2}
                    borderRadius={8}
                    _hover={{
                      background: 'white.100',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setVariant(MetricComponentVariant.EVENT);
                    }}
                    pointerEvents={'none'}
                  >
                    <i className="ri-group-fill"></i>
                    <Text marginLeft={2}>Segments</Text>
                  </Flex>
                </Flex>
              ) : variant === 'event' ? (
                <SearchableListDropdown
                  isOpen={isEventOrSegmentListOpen}
                  isLoading={isEventOrSegmentListLoading}
                  data={eventOrSegmentListSearchData}
                  onSubmit={handleEventOrSegmentSelection}
                  listKey={'id'}
                  isNode
                />
              ) : null
            ) : null}
          </Box>
        </Flex>
        <Box
          onClick={handleRemoveComponent}
          opacity={isHovered ? 1 : 0}
          cursor={'pointer'}
        >
          <Trash size={24} weight="bold" />
        </Box>
      </Flex>

      {reference && (
        <>
          <MetricAggregation
            aggregate={savedAggregate}
            updateAggregate={updateAggregate}
            eventProperties={eventProperties}
            loadingEventsAndProperties={loadingEventsAndProperties}
          />
          {Boolean(filters.length) &&
            filters.map((filter, index) => (
              <Fragment key={index}>
                <StepFilter
                  index={index}
                  filter={filter}
                  eventProperties={eventProperties}
                  loadingEventProperties={loadingEventsAndProperties}
                  handleSetFilterProperty={handleSetFilterPropertyValue}
                  handleSetFilterValue={handleSetFilterValue}
                  handleRemoveFilter={removeFilter}
                />
              </Fragment>
            ))}
          <AddFilterComponent
            filters={filters}
            eventProperties={eventProperties}
            handleAddFilter={handleAddFilter}
            loadingEventProperties={loadingEventsAndProperties}
          />
        </>
      )}
    </Flex>
  );
};

export default MetricComponentCard;
