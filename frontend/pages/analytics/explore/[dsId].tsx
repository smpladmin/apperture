import { ReactNode, useContext, useEffect, useState } from 'react';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { _getApps, _getAppsWithIntegrations } from '@lib/services/appService';
import { App, AppWithIntegrations } from '@lib/domain/app';
import Loading from '@components/Loading';
import Graph from '@components/Graph';
import Head from 'next/head';
import {
  getNodeSignificanceData,
  getSankeyData,
  getTrendsData,
  _getEdges,
} from '@lib/services/datasourceService';
import { Edge } from '@lib/domain/edge';
import { useDisclosure } from '@chakra-ui/react';
import EventDetails from '@components/EventDetails';
import { useRouter } from 'next/router';
import { MapContext } from '@lib/contexts/mapContext';
import { getAuthToken } from '@lib/utils/request';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const token = getAuthToken(req);
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
  const [eventData, setEventData] = useState({});
  const router = useRouter();
  const { dsId } = router.query;
  const {
    state: { activeNode },
  } = useContext(MapContext);

  const {
    isOpen: isEventDetailsDrawerOpen,
    onOpen: openEventDetailsDrawer,
    onClose: closeEventDetailsDrawer,
  } = useDisclosure();

  const {
    isOpen: isMobileEventDetailFloaterOpen,
    onOpen: openMobileEventDetailFloater,
    onClose: closeMobileEventDetailFloater,
  } = useDisclosure();

  useEffect(() => {
    setIsLoading(!edges.length);
  }, [edges.length]);

  useEffect(() => {
    if (activeNode) {
      openEventDetailsDrawer();
      openMobileEventDetailFloater();
    } else {
      closeEventDetailsDrawer();
    }
  }, [activeNode]);

  useEffect(() => {
    if (!activeNode) return;
    const fetchTrendsData = async () => {
      const [nodeSignificanceData, trendsData, sankeyData] = await Promise.all([
        getNodeSignificanceData(dsId as string, activeNode?._cfg?.id!!),
        getTrendsData(dsId as string, activeNode?._cfg?.id!!, 'week'),
        getSankeyData(dsId as string, activeNode?._cfg?.id!!),
      ]);

      setEventData({
        nodeSignificanceData,
        trendsData,
        sankeyData,
      });
    };
    fetchTrendsData();
  }, [activeNode]);

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
            eventData={eventData}
            setEventData={setEventData}
            isMobileEventDetailFloaterOpen={isMobileEventDetailFloaterOpen}
            closeMobileEventDetailFloater={closeMobileEventDetailFloater}
          />
          <Graph visualisationData={edges} />
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
