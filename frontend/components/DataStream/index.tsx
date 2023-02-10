import { Flex, Heading, Text } from '@chakra-ui/react';
import { Clickstream } from '@lib/domain/clickstream';
import { getClickStreamData } from '@lib/services/clickStreamService';
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
  console.log({ dsId });
  const [source, setSource] = useState<Source>(Source.STREAM);
  const [tableData, setTableData] = useState<Clickstream[]>([]);
  const [count, setCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchTableData = async () => {
      if (source == Source.STREAM) {
        const data = await getClickStreamData(dsId as string);
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
      <Heading
        fontSize={'xs-20'}
        lineHeight={'xs-21'}
        p={4}
        fontWeight={600}
        borderBottomWidth={1}
        w={'full'}
      >
        Data Stream
      </Heading>
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
