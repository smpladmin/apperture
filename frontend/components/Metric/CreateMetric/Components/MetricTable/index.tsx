import { Flex } from '@chakra-ui/react';
import React from 'react';
import DynamicTable from './DynamicTable';
import StaticTable from './StaticTable';

const MetricTable = ({ data }: any) => {
  return (
    <Flex paddingTop={10} alignItems={'flex-start'} alignContent={'flex-start'}>
      <StaticTable data={data} />
      {/* <DynamicTable data={data} /> */}
    </Flex>
  );
};

export default MetricTable;
