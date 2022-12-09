import { Box, Flex, IconButton, Text } from '@chakra-ui/react';
import { ARROW_GRAY } from '@theme/index';
import { useEffect, useState } from 'react';
import AddFilter from './AddFilter';
import 'remixicon/fonts/remixicon.css';

import SelectValue from './SelectValue';
import SelectEventProperty from './SelectEventProperty';
import { SegmentFilter, SegmentFilterConditions } from '@lib/domain/segment';

const QueryBuilder = ({
  eventProperties,
  loadingEventProperties,
  setGroups,
  setRefreshOnDelete,
}: any) => {
  const [filters, setFilters] = useState([]);
  const [conditions, setConditions] = useState<any[]>([]);

  useEffect(() => {
    setGroups([{ filters, conditions }]);
  }, [filters, conditions]);

  const removeFilter = (i: number) => {
    const updatedFilter = [...filters];
    updatedFilter.splice(i, 1);
    const updatedFilterOperators = [...conditions];
    updatedFilterOperators.splice(i, 1);

    // default value of operator for first query should always be 'where'
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
          {filters.map(
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
                      {conditions[i]}
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
        />
      </Flex>
    </Box>
  );
};

export default QueryBuilder;
