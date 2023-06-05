import { Button, Flex, Heading, Text } from '@chakra-ui/react';
import { Clickstream } from '@lib/domain/clickstream';
import { getClickstreamData } from '@lib/services/clickStreamService';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import StreamDataTable from './Components/StreamDataTable';

enum Source {
  STREAM = 'stream',
  ACTION = 'action',
}

const ViewStreamData = () => {
  const router = useRouter();
  const { dsId } = router.query;
  const [source, setSource] = useState<Source>(Source.STREAM);
  const [tableData, setTableData] = useState<Clickstream[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchTableData = async () => {
      if (source == Source.STREAM) {
        const data = await getClickstreamData(dsId as string);
        if (data) {
          setTableData(data.data);
          setCount(data.count);
        }
        setLoading(false);
      }
    };
    setLoading(true);
    fetchTableData();
  }, [source]);

  return (
    <Flex direction={'column'}>
      <Flex
        w={'full'}
        borderBottomWidth={1}
        justifyContent={'space-between'}
        alignItems={'center'}
        px={4}
      >
        <Heading
          fontSize={'xs-20'}
          lineHeight={'xs-21'}
          fontWeight={600}
          py={'4'}
          data-testid={'data-stream-heading'}
        >
          Data Stream
        </Heading>
      </Flex>
      <Flex direction={'column'} px={10} py={4}>
        <Flex gap={4}>
          <Text
            px={6}
            py={2}
            fontSize={'xs-14'}
            borderWidth={1}
            borderColor={source == Source.STREAM ? 'black.100' : 'inherit'}
            borderRadius={30}
            fontWeight={' 500'}
            lineHeight={'xs-18'}
            onClick={() => setSource(Source.STREAM)}
            cursor={'pointer'}
          >
            Clickstream
          </Text>
          <Text
            px={6}
            py={2}
            fontSize={'xs-14'}
            borderWidth={1}
            borderColor={source == Source.ACTION ? 'black.100' : 'inherit'}
            borderRadius={30}
            fontWeight={' 500'}
            lineHeight={'xs-18'}
            // onClick={() => setSource(Source.ACTION)}
            cursor={'not-allowed'}
            opacity={0.7}
          >
            Actions
          </Text>
        </Flex>
        <StreamDataTable
          tableData={tableData}
          count={count}
          isLoading={loading}
        />
      </Flex>
    </Flex>
  );
};

export default ViewStreamData;
