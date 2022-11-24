import Funnel from '@components/Funnel/ViewFunnel';
import Layout from '@components/Layout';
import { AppWithIntegrations } from '@lib/domain/app';
import { ComputedFunnel, FunnelTrendsData } from '@lib/domain/funnel';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges } from '@lib/services/datasourceService';
import {
  _getComputedFunnelData,
  _getComputedTrendsData,
} from '@lib/services/funnelService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';

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
    props: { apps, computedFunnelData, computedTrendsData },
  };
};

const ViewFunnel = ({
  computedFunnelData,
  computedTrendsData,
}: {
  computedFunnelData: ComputedFunnel;
  computedTrendsData: FunnelTrendsData[];
}) => {
  return <Funnel {...{ computedFunnelData, computedTrendsData }} />;
};

ViewFunnel.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default ViewFunnel;
