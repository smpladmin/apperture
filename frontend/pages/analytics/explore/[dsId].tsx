import { ReactNode, useEffect, useState } from 'react';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { _getApps, _getAppsWithIntegrations } from '@lib/services/appService';
import { App, AppWithIntegrations } from '@lib/domain/app';
import Loading from '@components/Loading';
import Graph from '@components/Graph';
import Head from 'next/head';
import { getTrendsData, _getEdges } from '@lib/services/datasourceService';
import { Edge } from '@lib/domain/edge';
import { useDisclosure } from '@chakra-ui/react';
import EventDetails from '@components/EventDetails';
import { Item } from '@antv/g6';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getAppsWithIntegrations(token);
  const edges = await _getEdges(token, query.dsId as string);
  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { apps, edges },
  };
};

type ExploreDataSourceProps = {
  apps: Array<App>;
  edges: Array<Edge>;
};

const ExploreDataSource = ({ edges }: ExploreDataSourceProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(!edges.length);
  const [selectedNode, setSelectedNode] = useState<Item | null>(null);
  const [trendsData, setTrendsData] = useState();
  const router = useRouter();
  const { dsId } = router.query;

  useEffect(() => {
    setIsLoading(!edges.length);
  }, [edges.length]);

  useEffect(() => {
    if (!selectedNode) return;
    const fetchTrendsData = async () => {
      const data = await getTrendsData(
        selectedNode?._cfg?.id!!,
        dsId as string,
        'week'
      );
      setTrendsData(data);
    };
    fetchTrendsData();
  }, [selectedNode]);

  const {
    isOpen: isEventDetailsDrawerOpen,
    onOpen: openEventDetailsDrawer,
    onClose: closeEventDetailsDrawer,
  } = useDisclosure();

  return (
    <>
      <Head>
        <title>Apperture</title>
        <meta name="description" content="Apperture Analytics" />
      </Head>
      {isLoading ? (
        <Loading />
      ) : (
        <>
          <EventDetails
            isEventDetailsDrawerOpen={isEventDetailsDrawerOpen}
            closeEventDetailsDrawer={closeEventDetailsDrawer}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
            trendsData={trendsData}
          />
          <Graph
            visualisationData={edges}
            openEventDetailsDrawer={openEventDetailsDrawer}
            selectedNode={selectedNode}
            setSelectedNode={setSelectedNode}
          />
        </>
      )}
    </>
  );
};

ExploreDataSource.getLayout = function getLayout(
  page: ReactNode,
  apps: AppWithIntegrations[]
) {
  return <Layout apps={apps}>{page}</Layout>;
};

export default ExploreDataSource;
