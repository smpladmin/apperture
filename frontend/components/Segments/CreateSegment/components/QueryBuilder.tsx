import { Box, Flex, Text } from '@chakra-ui/react';
import { ARROW_GRAY } from '@theme/index';
import { Fragment, useCallback } from 'react';
import AddFilter from './AddFilter';
import 'remixicon/fonts/remixicon.css';
import {
  FilterType,
  SegmentFilter,
  SegmentFilterConditions,
  SegmentFilterOperators,
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
    (
      filtersToUpdate?: SegmentFilter[],
      conditionsToUpdate?: SegmentFilterConditions[]
    ) => {
      const tempGroup = cloneDeep(groups);
      if (filtersToUpdate) {
        tempGroup[groupIndex]['filters'] = filtersToUpdate;
      }
      if (conditionsToUpdate) {
        tempGroup[groupIndex]['conditions'] = conditionsToUpdate;
      }

      setGroups(tempGroup);
    },
    [groups]
  );

  const removeFilter = (filterIndex: number) => {
    const updatedFilters = [...group.filters];
    updatedFilters.splice(filterIndex, 1);

    const updatedFilterConditions = [...group.conditions];
    const conditionRemoved = updatedFilterConditions.splice(filterIndex, 1);

    if (conditionRemoved[0] === SegmentFilterConditions.WHERE) {
      updatedFilterConditions[filterIndex] = SegmentFilterConditions.WHERE;
    }
    // if first 'who' filter type condition is removed from list of filter,
    // then make the next who filter type condition 'who'
    else if (conditionRemoved[0] === SegmentFilterConditions.WHO) {
      updatedFilterConditions[filterIndex] = SegmentFilterConditions.WHO;
    }

    if (updatedFilterConditions[0])
      // default value of operator for first query should always be
      // either 'where' or 'who' depending upon the filter type
      updatedFilterConditions[0] =
        updatedFilters[0]?.type === FilterType.WHERE
          ? SegmentFilterConditions.WHERE
          : SegmentFilterConditions.WHO;

    updateGroupsState(updatedFilters, updatedFilterConditions);
    setRefreshOnDelete(true);
  };

  return (
    <Box
      p={'4'}
      borderRadius={'12'}
      borderWidth={'0.4px'}
      borderColor={'grey.100'}
      minH={'20'}
      mt={'4'}
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
                <Fragment key={i}>
                  {filter.type === FilterType.WHERE ? (
                    <WhereSegmentFilterComponent
                      filter={filter as WhereSegmentFilter}
                      filters={filters}
                      group={group}
                      updateGroupsState={updateGroupsState}
                      eventProperties={eventProperties}
                      index={i}
                      removeFilter={removeFilter}
                    />
                  ) : (
                    <WhoSegmentFilterComponent
                      filter={filter as WhoSegmentFilter}
                      filters={filters}
                      group={group}
                      updateGroupsState={updateGroupsState}
                      eventProperties={eventProperties}
                      index={i}
                      removeFilter={removeFilter}
                    />
                  )}
                </Fragment>
              );
            }
          )}
        </Flex>
        <AddFilter
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventProperties}
          filters={group.filters}
          conditions={group.conditions}
          updateGroupsState={updateGroupsState}
        />
      </Flex>
    </Box>
  );
};

export default QueryBuilder;
