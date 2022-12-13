import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { ARROW_GRAY } from '@theme/index';
import { useEffect, useState } from 'react';
import AddFilter from './AddFilter';
import 'remixicon/fonts/remixicon.css';
import SelectValue from './SelectValue';
import SelectEventProperty from './SelectEventProperty';
import { SegmentFilter, SegmentFilterConditions } from '@lib/domain/segment';
import { cloneDeep } from 'lodash';

const QueryBuilder = ({
  eventProperties,
  loadingEventProperties,
  setGroups,
  setRefreshOnDelete,
  group,
  groupIndex,
  groups,
}: any) => {
  // const [filters, setFilters] = useState([]);
  // const [conditions, setConditions] = useState<any[]>([]);

  // useEffect(() => {
  //   setGroups([{ filters, conditions }]);
  // }, [filters, conditions]);
  console.log(groups);

  const setFilters = (value: any) => {
    console.log('parameter value', value);
    // const dummyGroup = cloneDeep(groups);
    // // console.log('dummy group', dummyGroup);
    // dummyGroup[groupIndex]['filters'] = value;
    setGroups((prevState: any) => {
      prevState[groupIndex]['filters'] = value;
      return prevState;
    });
  };
  const setConditions = (value: any) => {
    const dummyGroup = cloneDeep(groups);
    dummyGroup[groupIndex]['conditions'] = value;
    setGroups(dummyGroup);
  };

  const removeFilter = (filterIndex: number) => {
    const updatedFilter = [...group.filters];
    updatedFilter.splice(filterIndex, 1);
    const updatedFilterOperators = [...group.conditions];
    updatedFilterOperators.splice(filterIndex, 1);

    // default value of operator for first query should always be 'where'
    if (updatedFilterOperators[0])
      updatedFilterOperators[0] = SegmentFilterConditions.WHERE;

    setFilters([...updatedFilter]);
    setConditions([...updatedFilterOperators]);
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
                <Flex key={i} gap={'3'} alignItems={'center'}>
                  <Box w={'12'}>
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'500'}
                      color={'grey.200'}
                      textAlign={'right'}
                    >
                      {group.conditions[i]}
                    </Text>
                  </Box>
                  <SelectEventProperty
                    index={i}
                    filter={filter}
                    eventProperties={eventProperties}
                    filters={filters}
                    setFilters={setFilters}
                  />
                  <Box>
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'600'}
                      px={'2'}
                      py={'2'}
                      bg={'white.100'}
                      cursor={'pointer'}
                    >
                      {filter.operator}
                    </Text>
                  </Box>
                  <SelectValue
                    filter={filter}
                    filters={filters}
                    setFilters={setFilters}
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
          setFilters={setFilters}
          setConditions={setConditions}
          loadingEventProperties={loadingEventProperties}
          filters={cloneDeep(group.filters)}
          conditions={group.conditions}
        />
      </Flex>
    </Box>
  );
};

export default QueryBuilder;
