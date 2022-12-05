import Funnel from '@components/Funnel/CreateFunnel';
import Layout from '@components/Layout';
import { MapContext } from '@lib/contexts/mapContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { ComputedFunnel, FunnelTrendsData } from '@lib/domain/funnel';
import { Node } from '@lib/domain/node';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges, _getNodes } from '@lib/services/datasourceService';
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
  const nodes = await _getNodes(token, query.dsId as string);

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
    props: { nodes, apps, computedFunnelData, computedTrendsData },
  };
};

const EditFunnel = ({
  nodes,
  computedFunnelData,
  computedTrendsData,
}: {
  nodes: Node[];
  computedFunnelData: ComputedFunnel;
  computedTrendsData: FunnelTrendsData[];
}) => {
  const { dispatch } = useContext(MapContext);

  useEffect(() => {
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
