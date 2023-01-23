import ViewFunnelComponent from '@components/Funnel/ViewFunnel';
import Layout from '@components/Layout';
import { AppWithIntegrations } from '@lib/domain/app';
import { Funnel } from '@lib/domain/funnel';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges } from '@lib/services/datasourceService';
import { _getSavedFunnel } from '@lib/services/funnelService';
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
  const apps = await _getAppsWithIntegrations(token);
  const savedFunnel = await _getSavedFunnel(token, query.funnelId as string);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedFunnel) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: { apps, savedFunnel },
  };
};

const ViewFunnel = ({ savedFunnel }: { savedFunnel: Funnel }) => {
  return <ViewFunnelComponent savedFunnel={savedFunnel} />;
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
