import Funnel from '@components/Funnel/CreateFunnel';
import { transformData } from '@components/Graph/transformData';
import Layout from '@components/Layout';
import { MapContext } from '@lib/contexts/mapContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { Edge } from '@lib/domain/edge';
import { ComputedFunnel, FunnelTrendsData } from '@lib/domain/funnel';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges } from '@lib/services/datasourceService';
import {
  _getComputedFunnelData,
  _getComputedTrendsData,
} from '@lib/services/funnelService';
import { Actions } from '@lib/types/context';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement, useContext, useEffect } from 'react';

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
  const { funnelId } = query;
  const apps = await _getAppsWithIntegrations(token);
  const edges = await _getEdges(token, query.dsId as string);

  const [computedFunnelData, computedTrendsData] = await Promise.all([
    _getComputedFunnelData(token, funnelId as string),
    _getComputedTrendsData(token, funnelId as string),
  ]);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { edges, apps, computedFunnelData, computedTrendsData },
  };
};

const EditFunnel = ({
  edges,
  computedFunnelData,
  computedTrendsData,
}: {
  edges: Edge[];
  computedFunnelData: ComputedFunnel;
  computedTrendsData: FunnelTrendsData[];
}) => {
  const { dispatch } = useContext(MapContext);

  useEffect(() => {
    const { nodes } = transformData(edges);
    dispatch({
      type: Actions.SET_NODES,
      payload: nodes,
    });
  }, []);
  return <Funnel {...{ ...computedFunnelData, computedTrendsData }} />;
};

EditFunnel.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default EditFunnel;
