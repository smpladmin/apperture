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
import { sankeyData } from '../data';
import { formatDatalabel } from '@lib/utils/graph';
import { Fragment } from 'react';

const StatsNode = ({ data }: { data: any }) => {
  return (
    <Flex justifyContent={'space-between'} py={'6'} alignItems={'center'}>
      <Text
        w={'55'}
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

const SankeyNodesTabs = () => {
  return (
    <Tabs>
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
            .filter((sd) => sd.flow === 'inward')
            .map((data, i, inflowNode) => {
              return (
                <Fragment key={data.node}>
                  <StatsNode data={data} />
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
            .filter((sd) => sd.flow === 'outward')
            .map((data, i, outflowNode) => {
              return (
                <Fragment key={data.node}>
                  <StatsNode data={data} />
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
