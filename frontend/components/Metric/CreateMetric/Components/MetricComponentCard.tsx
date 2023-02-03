import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import React, { useEffect, useRef, useState } from 'react';
import MetricFilterComponent from './MetricFilterComponent';
import MetricAddFilterComponent from './MetricAddFilterComponent';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import {
  EventOrSegmentComponent,
  MetricComponentVariant,
  MetricEventFilter,
} from '@lib/domain/metric';
import { Node } from '@lib/domain/node';

type MetricComponentCardProps = {
  variable: string;
  eventList: Node[];
  eventProperties: string[];
  loadingEventProperties: boolean;
  loadingEventsList: boolean;
  updateAggregate: Function;
  removeAggregate: Function;
  savedAggregate: EventOrSegmentComponent;
};

const MetricComponentCard = ({
  variable,
  eventList,
  eventProperties,
  loadingEventProperties,
  loadingEventsList,
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
  const [aggregationFunction, setAggregationFunction] = useState('count');
  const [filters, setFilters] = useState<MetricEventFilter[]>(
    savedAggregate?.filters || []
  );
  const [conditions, setConditions] = useState(
    savedAggregate?.conditions || ['where']
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
      aggregations: { property: selection.id, functions: 'count' },
    });
    setReference(selection.id);
  };

  const handleSetCondition = (ref: number, value: string) => {
    const newConditions = conditions.map((condition, index) =>
      index === ref ? value : condition
    );

    setConditions(newConditions);
  };
  const handleAddFilter = (value: string) => {
    setFilters([
      ...filters,
      { operand: value, operator: 'equals', values: [] },
    ]);
    setConditions((prevState) => [
      ...prevState,
      prevState.length ? 'and' : 'where',
    ]);
  };

  const handleSetFilter = (ref: number, updatedFilter: MetricEventFilter) => {
    setFilters(
      filters.map((filter, index) =>
        ref == index ? { ...filter, ...updatedFilter } : filter
      )
    );
  };

  const handleRemoveComponent = () => {
    removeAggregate(variable);
  };

  const removeFilter = (reference: number) => {
    setFilters(filters.filter((_, index) => index != reference));
    const updatedConditions = conditions.filter(
      (_, index) => index != reference
    );
    if (updatedConditions.length) updatedConditions[0] = 'where';
    setConditions([...updatedConditions]);
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

  return (
    <Flex
      data-testid="event-or-segment-component"
      justifyContent={'space-between'}
      alignItems={'center'}
      direction={'column'}
      borderRadius={'12px'}
      border={'1px solid rgba(255, 255, 255, 0.2)'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      py={5}
    >
      <Flex px={5} width={'full'} alignItems={'center'}>
        <Flex
          data-testid="event-or-segment-component-variable"
          background={'#9999B6'}
          borderRadius={'2px'}
          textAlign="center"
          fontWeight={500}
          color={'black.100'}
          fontSize={'xs-10'}
          lineHeight={'12px'}
          justifyContent={'center'}
          alignItems={'center'}
          height={'16px'}
          width={'16px'}
        >
          {variable}
        </Flex>
        <Flex
          grow={1}
          paddingLeft={1}
          mx={1}
          cursor={'pointer'}
          borderRadius={4}
          _hover={{ background: 'grey.300' }}
          data-testid="select-event-segment"
          onClick={() => setIsEventOrSegmentListOpen((prevState) => !prevState)}
        >
          <Box position="relative" ref={EventOrSegmentBox}>
            <Text
              data-testid={'event-or-segment-name'}
              color={'white'}
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
                    <i className="ri-cursor-fill"></i>
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
        <IconButton
          data-testid="remove-event-or-segment-component"
          size={'xs'}
          fontWeight={'500'}
          aria-label="remove-component"
          variant={'iconButton'}
          icon={<i className="ri-close-fill"></i>}
          color={'grey.200'}
          opacity={isHovered ? 1 : 0}
          _hover={{ color: 'white', background: 'grey.300' }}
          onClick={handleRemoveComponent}
        />
      </Flex>
      {reference && (
        <>
          <Flex width={'full'} alignItems={'center'}>
            <Text
              color={'white'}
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              marginLeft={4}
              cursor={'not-allowed'}
              px={2}
              borderRadius={4}
              _hover={{ color: 'white', background: 'grey.300' }}
            >
              Total Count
            </Text>
          </Flex>
          {Boolean(filters.length) &&
            filters.map((filter, index) => (
              <MetricFilterComponent
                condition={conditions[index]}
                operand={filter.operand}
                key={index}
                operator={filter.operator}
                values={filter.values}
                index={index}
                handleSetCondition={handleSetCondition}
                handleSetFilter={handleSetFilter}
                removeFilter={removeFilter}
                eventProperties={eventProperties}
                loadingEventProperties={loadingEventProperties}
              />
            ))}
          <MetricAddFilterComponent
            eventProperties={eventProperties}
            loadingEventProperties={loadingEventProperties}
            handleAddFilter={handleAddFilter}
          />
        </>
      )}
    </Flex>
  );
};

export default MetricComponentCard;
