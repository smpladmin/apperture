import { Sankey } from '@antv/g2plot';

import { Box, Flex, Text } from '@chakra-ui/react';
import { SankeyData } from '@lib/domain/eventData';

import { useEffect, useRef } from 'react';
import SankeyNodesTabs from './SankeyNodesTabs';

const SankeyGraph = ({ sankeyData }: { sankeyData: Array<SankeyData> }) => {
  const sankeyRef = useRef<HTMLDivElement>(null);
  const plot = useRef<{ sankey: Sankey | null }>({ sankey: null });
  useEffect(() => {
    plot.current.sankey = new Sankey(sankeyRef.current!!, {
      data: sankeyData,
    });
  }, []);

  useEffect(() => {
    plot.current.sankey?.update({
      data: sankeyData,
      autoFit: true,
      sourceField: 'previousEvent',
      targetField: 'currentEvent',
      weightField: 'hitsPercentage',
      nodeWidth: 22,
      nodeDraggable: true,
      nodeWidthRatio: 0.04,
      nodePaddingRatio: 0.05,
      rawFields: ['path'],
      tooltip: {
        fields: ['source', 'target', 'value'],
        formatter: ({ source, target, value }) => {
          return {
            name: source + ' -> ' + target,
            value: value + '%',
          };
        },
      },
    });
    plot.current.sankey?.render();
  }, [sankeyData]);

  return (
    <Flex py={'6'} direction={'column'} gap={'5'}>
      <Text fontWeight={'medium'} fontSize={'sh-18'} lineHeight={'sh-18'}>
        Sankey
      </Text>
      <Box ref={sankeyRef} />
      <Box py={'5'} mb={'5'}>
        <SankeyNodesTabs sankeyData={sankeyData} />
      </Box>
    </Flex>
  );
};

export default SankeyGraph;
