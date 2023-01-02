import { Box, Flex, Text } from '@chakra-ui/react';
import { ARROW_GRAY } from '@theme/index';
import { useCallback } from 'react';
import AddFilter from './AddFilter';
import 'remixicon/fonts/remixicon.css';
import {
  FilterType,
  SegmentFilter,
  SegmentFilterConditions,
  SegmentGroup,
  SegmentProperty,
  WhereSegmentFilter,
  WhoSegmentFilter,
} from '@lib/domain/segment';
import { cloneDeep } from 'lodash';
import WhereSegmentFilterComponent from './SegmentFilter/WhereSegmentFilter';
import WhoSegmentFilterComponent from './SegmentFilter/WhoSegmentFilter';

type QueryBuilderProps = {
  eventProperties: SegmentProperty[];
  loadingEventProperties: boolean;
  setGroups: Function;
  setRefreshOnDelete: Function;
  group: SegmentGroup;
  groupIndex: number;
  groups: SegmentGroup[];
};

const QueryBuilder = ({
  eventProperties,
  loadingEventProperties,
  setGroups,
  setRefreshOnDelete,
  group,
  groupIndex,
  groups,
}: QueryBuilderProps) => {
  // a utility function to update group state
  // should be used across all segment components, so it remains easy to track state update
  const updateGroupsState = useCallback(
    (filtersToUpdate?: SegmentFilter[]) => {
      const tempGroup = cloneDeep(groups);
      if (filtersToUpdate) {
        tempGroup[groupIndex]['filters'] = filtersToUpdate;
      }

      setGroups(tempGroup);
    },
    [groups]
  );

  const removeFilter = (filterIndex: number) => {
    const updatedFilters = [...group.filters];
    const conditionRemoved = updatedFilters.splice(filterIndex, 1);

    // check if the filterIndex removed is less than updatedFilterConditions length
    // to ensure we don't replace condition on wrong index while solving for where/who conditions
    if (filterIndex < updatedFilters.length) {
      if (conditionRemoved[0]?.condition === SegmentFilterConditions.WHERE) {
        updatedFilters[filterIndex].condition = SegmentFilterConditions.WHERE;
      }
      // if first 'who' filter type condition is removed from list of filter,
      // then make the next who filter type condition 'who'
      else if (conditionRemoved[0]?.condition === SegmentFilterConditions.WHO) {
        updatedFilters[filterIndex].condition = SegmentFilterConditions.WHO;
      }
    }

    updateGroupsState(updatedFilters);
    setRefreshOnDelete(true);
  };

  return (
    <Box
      p={'4'}
      borderRadius={'12'}
      borderWidth={'0.4px'}
      borderColor={'grey.100'}
      minH={'20'}
    >
      <Text
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'500'}
        color={ARROW_GRAY}
      >
        ALL USERS
      </Text>
      <Flex direction={'column'} mt={'4'} gap={'3'}>
        <Flex direction={'column'} gap={'4'}>
          {group.filters.map(
            (filter: SegmentFilter, i: number, filters: SegmentFilter[]) => {
              return (
                <Flex key={i} data-testid="query-builder">
                  {filter.type === FilterType.WHERE ? (
                    <WhereSegmentFilterComponent
                      filter={filter as WhereSegmentFilter}
                      filters={filters}
                      updateGroupsState={updateGroupsState}
                      eventProperties={eventProperties}
                      index={i}
                      removeFilter={removeFilter}
                    />
                  ) : (
                    <WhoSegmentFilterComponent
                      filter={filter as WhoSegmentFilter}
                      filters={filters}
                      updateGroupsState={updateGroupsState}
                      eventProperties={eventProperties}
                      index={i}
                      removeFilter={removeFilter}
                    />
                  )}
                </Flex>
              );
            }
          )}
        </Flex>
        <AddFilter
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventProperties}
          filters={group.filters}
          updateGroupsState={updateGroupsState}
        />
      </Flex>
    </Box>
  );
};

export default QueryBuilder;
