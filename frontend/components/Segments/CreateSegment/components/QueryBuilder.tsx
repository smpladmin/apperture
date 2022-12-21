import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { ARROW_GRAY } from '@theme/index';
import { useCallback } from 'react';
import AddFilter from './AddFilter';
import 'remixicon/fonts/remixicon.css';
import SelectValue from './SelectValue';
import SelectEventProperty from './SelectEventProperty';
import {
  SegmentFilter,
  SegmentFilterConditions,
  SegmentGroup,
} from '@lib/domain/segment';
import { cloneDeep } from 'lodash';

type QueryBuilderProps = {
  eventProperties: string[];
  loadingEventProperties: boolean;
  setGroups: Function;
  setRefreshOnDelete: Function;
  group: SegmentGroup;
  groupIndex: number;
  groups: SegmentGroup[];
};
import FilterConditions from './FilterConditions';
import FilterOperator from './FilterOperator';

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
                <Flex
                  key={i}
                  gap={'3'}
                  alignItems={'center'}
                  data-testid="query-builder"
                >
                  <FilterConditions
                    index={i}
                    conditions={group.conditions}
                    updateGroupsState={updateGroupsState}
                  />
                  <SelectEventProperty
                    index={i}
                    filter={filter}
                    eventProperties={eventProperties}
                    filters={filters}
                    updateGroupsState={updateGroupsState}
                  />
                  <FilterOperator filter={filter} />
                  <SelectValue
                    filter={filter}
                    filters={filters}
                    updateGroupsState={updateGroupsState}
                    index={i}
                  />
                  <IconButton
                    aria-label="delete"
                    size={'sm'}
                    icon={<i className="ri-delete-bin-6-line"></i>}
                    onClick={() => removeFilter(i)}
                    bg={'white.DEFAULT'}
                    variant={'secondary'}
                  />
                </Flex>
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
