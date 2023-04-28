import { Box, Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { MapContext } from '@lib/contexts/mapContext';
import { FunnelStep } from '@lib/domain/funnel';
import { RetentionEvents } from '@lib/domain/retention';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Node } from '@lib/domain/node';
import StepFilter from '@components/StepFilters/StepFilters';
import AddFilterComponent from '@components/StepFilters/AddFilter';
import { getEventProperties } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import {
  FilterConditions,
  FilterDataType,
  FilterOperatorsString,
  FilterType,
  WhereFilter,
} from '@lib/domain/common';
import { cloneDeep } from 'lodash';

type SelectEventsRetentionProps = {
  retentionEvent: FunnelStep;
  eventKey: keyof RetentionEvents;
  index: number;
  retentionEvents: RetentionEvents;
  setRetentionEvents: Function;
};

const SelectEventsRetention = ({
  index,
  retentionEvent,
  eventKey,
  retentionEvents,
  setRetentionEvents,
}: SelectEventsRetentionProps) => {
  const {
    state: { nodes },
  } = useContext(MapContext);

  const eventDropdownRef = useRef(null);
  const router = useRouter();
  const { dsId } = router.query;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  useOnClickOutside(eventDropdownRef, () => {
    setIsDropdownOpen(false);
  });

  const [eventProperties, setEventProperties] = useState<string[]>([]);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [loadingEventProperties, setLoadingEventProperties] =
    useState<boolean>(false);

  const handleEventSelection = (event: Node) => {
    const existingFilters = retentionEvents[eventKey].filters;
    const updatedRetentionEvents = {
      ...retentionEvents,
      [eventKey]: { event: event.id, filters: existingFilters },
    };
    setRetentionEvents(updatedRetentionEvents);

    setIsDropdownOpen(false);
  };

  useEffect(() => {
    const fetchEventProperties = async () => {
      const properties = await getEventProperties(dsId as string);
      setEventProperties(properties);
      setLoadingEventProperties(false);
    };

    setLoadingEventProperties(true);
    fetchEventProperties();
  }, []);

  const updateEventFilters = useCallback(
    (stepFilters: WhereFilter[]) => {
      const tempRetentionEvents = cloneDeep(retentionEvents);
      tempRetentionEvents[eventKey].filters = stepFilters;
      setRetentionEvents(tempRetentionEvents);
    },
    [retentionEvents]
  );

  const handleSetFilterProperty = (filterIndex: number, property: string) => {
    let stepFilters = [...retentionEvent.filters];
    stepFilters[filterIndex]['operand'] = property;

    updateEventFilters(stepFilters);
  };

  const handleSetFilterValue = (filterIndex: number, values: string[]) => {
    let stepFilters = [...retentionEvent.filters];
    stepFilters[filterIndex]['values'] = values;

    updateEventFilters(stepFilters);
  };

  const handleRemoveFilter = (filterIndex: number) => {
    let stepFilters = [...retentionEvent.filters];
    stepFilters.splice(filterIndex, 1);

    if (filterIndex === 0 && stepFilters.length)
      stepFilters[0]['condition'] = FilterConditions.WHERE;

    updateEventFilters(stepFilters);
  };

  const handleAddFilter = (value: string) => {
    const getFilterCondition = (stepFilters: WhereFilter[]) => {
      return !stepFilters.length
        ? FilterConditions.WHERE
        : FilterConditions.AND;
    };

    const stepFilters = [...retentionEvent.filters];
    stepFilters.push({
      condition: getFilterCondition(stepFilters),
      operand: value,
      operator: FilterOperatorsString.IS,
      values: [],
      type: FilterType.WHERE,
      all: false,
      datatype: FilterDataType.STRING,
    });

    updateEventFilters(stepFilters);
  };

  return (
    <Flex
      p={'3'}
      borderRadius={'8px'}
      border={'1px'}
      borderColor={isHovered ? 'grey.700 ' : 'white.200'}
      direction={'column'}
      cursor={'grab'}
      data-testid={'funnel-step'}
      backgroundColor={'white.DEFAULT'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      gap={'2'}
    >
      <Flex gap={3} flexDirection="column">
        <Flex width={'full'}>
          <Flex
            width={'full'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Flex alignItems={'center'} gap={'1'} flexGrow={'1'}>
              <Flex
                background={'blue.500'}
                borderRadius={'4px'}
                textAlign="center"
                fontWeight={600}
                color={'white'}
                fontSize={'xs-10'}
                lineHeight={'xs-10'}
                justifyContent={'center'}
                alignItems={'center'}
                height={'5'}
                width={'5'}
                cursor={'grab'}
              >
                {String.fromCharCode(65 + index)}
              </Flex>
              <Box
                position="relative"
                w={'full'}
                borderRadius={'4'}
                ref={eventDropdownRef}
              >
                <Text
                  color={retentionEvent.event ? 'black.DEFAULT' : 'grey.600'}
                  fontSize={'xs-14'}
                  fontWeight={retentionEvent.event ? 500 : 400}
                  p={'1'}
                  _hover={{
                    background: 'white.400',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                  lineHeight={'xs-14'}
                  onClick={() => {
                    setIsDropdownOpen(true);
                  }}
                  data-testid={'event-selection'}
                >
                  {retentionEvent.event || 'Select  Event'}
                </Text>
                <SearchableListDropdown
                  isOpen={isDropdownOpen}
                  isLoading={false}
                  data={nodes}
                  onSubmit={handleEventSelection}
                  listKey={'id'}
                  isNode
                  placeholderText={'Search for events...'}
                  width={'96'}
                />
              </Box>
            </Flex>
          </Flex>
        </Flex>
        {Boolean(retentionEvent.filters?.length) && (
          <Flex direction={'column'} gap={'2'}>
            {retentionEvent.filters.map((filter, index) => (
              <Fragment key={index}>
                <StepFilter
                  index={index}
                  filter={filter}
                  eventProperties={eventProperties}
                  loadingEventProperties={loadingEventProperties}
                  handleSetFilterProperty={handleSetFilterProperty}
                  handleSetFilterValue={handleSetFilterValue}
                  handleRemoveFilter={handleRemoveFilter}
                />
              </Fragment>
            ))}
          </Flex>
        )}
        {retentionEvent.event ? (
          <AddFilterComponent
            filters={retentionEvent.filters}
            eventProperties={eventProperties}
            loadingEventProperties={loadingEventProperties}
            handleAddFilter={handleAddFilter}
          />
        ) : null}
      </Flex>
    </Flex>
  );
};

export default SelectEventsRetention;
