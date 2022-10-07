import {
  Box,
  Divider,
  Flex,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from '@chakra-ui/react';
import { FlowType, SankeyData } from '@lib/domain/eventData';

import { formatDatalabel } from '@components/Graph/graphUtil';
import { Fragment } from 'react';

const SankeyNodeStats = ({ data }: { data: SankeyData }) => {
  return (
    <Flex justifyContent={'space-between'} py={'6'} alignItems={'center'}>
      <Text
        w={{ base: '40', md: '55' }}
        fontSize={'xs-14'}
        lineHeight={'xs-14'}
        fontWeight={'normal'}
        textDecoration={'underline'}
      >
        {data.node}
      </Text>
      <Flex direction={'column'} w={'14'}>
        <Text
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'medium'}
        >{`${data.hitsPercentage}%`}</Text>
        <Text fontSize={'xs-12'} lineHeight={'base'} color={'grey.200'}>
          {formatDatalabel(data.hits)}
        </Text>
      </Flex>
    </Flex>
  );
};

const SankeyNodesTabs = ({ sankeyData }: { sankeyData: Array<SankeyData> }) => {
  return (
    <Tabs
      defaultIndex={
        !sankeyData.some((sd) => sd.flow === FlowType.INFLOW) ? 1 : 0
      }
    >
      <TabList>
        <Tab
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'normal'}
          color={'black.100'}
          pl={0}
          _selected={{
            color: '#0e0e1a',
            fontWeight: '600',
            borderColor: 'black.100',
          }}
        >
          Inflow
        </Tab>
        <Tab
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'normal'}
          color={'black.100'}
          _selected={{
            color: '#0e0e1a',
            fontWeight: '600',
            borderColor: 'black.100',
          }}
        >
          Outflow
        </Tab>
      </TabList>
      <TabPanels>
        <TabPanel p={0}>
          {sankeyData
            .filter((sd) => sd.flow === FlowType.INFLOW)
            .map((data, i, inflowNode) => {
              return (
                <Fragment key={data.node}>
                  <SankeyNodeStats data={data} />
                  {i !== inflowNode.length - 1 && (
                    <Divider
                      orientation="horizontal"
                      borderColor={'white.200'}
                      opacity={1}
                    />
                  )}
                </Fragment>
              );
            })}
        </TabPanel>
        <TabPanel p={0}>
          {sankeyData
            .filter((sd) => sd.flow === FlowType.OUTFLOW)
            .map((data, i, outflowNode) => {
              return (
                <Fragment key={data.node}>
                  <SankeyNodeStats data={data} />
                  {i !== outflowNode.length - 1 && (
                    <Divider
                      orientation="horizontal"
                      borderColor={'white.200'}
                      opacity={1}
                    />
                  )}
                </Fragment>
              );
            })}
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default SankeyNodesTabs;
