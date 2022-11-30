import Layout from '@components/Layout';
import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges } from '@lib/services/datasourceService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { computeSegment } from '@lib/services/segmentService';
import {
  Box,
  Input,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import { range } from 'lodash';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getAuthToken(req);
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getAppsWithIntegrations(token);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { apps },
  };
};

const CreateSegment = () => {
  const router = useRouter();
  const [segments, setSegments] = useState([[]]);
  const [events, setEvents] = useState(Array(5).fill(''));

  useEffect(() => {
    const fetchSegments = async () => {
      const _segments = await computeSegment(router.query.dsId as string, []);
      setSegments(_segments);
    };
    fetchSegments();
  }, [router.query.dsId]);

  const onInputChange = (text: string, index: number) => {
    const _events = [...events];
    _events[index] = text;
    setEvents(_events);
  };

  const getOperator = (text: string) => {
    const operators = [
      { sign: '>=', name: 'ge' },
      { sign: '<=', name: 'le' },
      { sign: '>', name: 'gt' },
      { sign: '<', name: 'lt' },
    ];
    for (let operator of operators) {
      if (text.includes(operator.sign)) {
        return operator;
      }
    }
  };

  useEffect(() => {
    const filters = events
      .filter((e) => e)
      .map((event) => {
        const operator = getOperator(event);
        if (!operator) {
          return { event };
        }
        const [eventName, operand] = event.split(operator.sign);
        return {
          event: eventName.trim(),
          operator: operator.name,
          operand: Number(operand.trim()),
        };
      });

    console.log(filters);

    if (!filters.length) return;

    const fetchSegments = async () => {
      const _segments = await computeSegment(
        router.query.dsId as string,
        filters
      );
      setSegments(_segments);
    };
    fetchSegments();
  }, [events]);

  return (
    <Box>
      <TableContainer>
        <Table variant="simple">
          <TableCaption>Segments</TableCaption>
          <Thead>
            <Tr>
              <Th>
                <Input disabled />
              </Th>
              {range(5).map((i) => {
                return (
                  <Th key={`input-${i}`}>
                    <Input
                      value={events[i]}
                      onChange={(e) => onInputChange(e.target.value, i)}
                    />
                  </Th>
                );
              })}
            </Tr>
          </Thead>
          <Thead>
            <Tr>
              <Th>User ID</Th>
              {range(5).map((i) => {
                return <Th key={`col-${i}`}>{`Col${i}`}</Th>;
              })}
            </Tr>
          </Thead>
          <Tbody>
            {segments.map((_, i) => {
              return (
                <Tr key={`dr-${i}`}>
                  {range(6).map((j) => {
                    return <Td key={`di-${j}`}>{segments[i][j]}</Td>;
                  })}
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

CreateSegment.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default CreateSegment;
