import { Box, Flex, Text } from '@chakra-ui/react';
import { ARROW_GRAY } from '@theme/index';
import { useCallback } from 'react';
import AddFilter from './AddFilter';
import 'remixicon/fonts/remixicon.css';
import {
  SegmentFilter,
  SegmentFilterConditions,
  SegmentGroup,
  SegmentProperty,
} from '@lib/domain/segment';
import { cloneDeep } from 'lodash';
import WhereSegmentFilter from './SegmentFilter/WhereSegmentFilter';

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
    const updatedFilter = [...group.filters];
    updatedFilter.splice(filterIndex, 1);

    const updatedFilterOperators = [...group.conditions];
    updatedFilterOperators.splice(filterIndex, 1);
    // default value of operator for first query should always be 'where'
    if (updatedFilterOperators[0])
      updatedFilterOperators[0] = SegmentFilterConditions.WHERE;

    updateGroupsState(updatedFilter, updatedFilterOperators);
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
                <WhereSegmentFilter
                  key={i}
                  filter={filter}
                  filters={filters}
                  group={group}
                  updateGroupsState={updateGroupsState}
                  eventProperties={eventProperties}
                  index={i}
                  removeFilter={removeFilter}
                />
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
