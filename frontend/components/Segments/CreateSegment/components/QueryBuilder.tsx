import { Box, Button, Flex, IconButton, Text } from '@chakra-ui/react';
import { ARROW_GRAY } from '@theme/index';
import { useEffect, useState } from 'react';
import AddFilter from './AddFilter';
import 'remixicon/fonts/remixicon.css';
import { useRouter } from 'next/router';
import { getEventProperties } from '@lib/services/datasourceService';

const QueryBuilder = () => {
  const [groups, setGroups] = useState<any[]>([]);
  const [filters, setFilters] = useState([]);
  const [filterOperators, setFilterOperators] = useState([]);
  const [eventProperties, setEventProperties] = useState([]);
  const router = useRouter();
  const { dsId } = router.query;

  useEffect(() => {
    const fetchEventProperties = async () => {
      const data = await getEventProperties(dsId as string);
      setEventProperties(data);
    };
    fetchEventProperties();
  }, []);

  const removeFilter = (i: number) => {
    const updatedFilter = [...filters];
    updatedFilter.splice(i, 1);
    setFilters([...updatedFilter]);
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
      <Flex direction={'column'}>
        {filters.map((filter: any, i) => {
          return (
            <Flex key={i} gap={'3'}>
              <Text>{filterOperators[i]}</Text>
              <Box>{filter.operand}</Box>
              <Box>{filter.operator}</Box>
              <Box>{filter.value || 'Select Value...'}</Box>
              <IconButton
                aria-label="delete"
                icon={<i className="ri-delete-bin-6-line"></i>}
                onClick={() => removeFilter(i)}
              />
            </Flex>
          );
        })}
        <AddFilter
          setFilters={setFilters}
          setFilterOperators={setFilterOperators}
        />
      </Flex>
    </Box>
  );
};

export default QueryBuilder;
