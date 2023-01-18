import Funnel from '@components/Funnel/ViewFunnel';
import Layout from '@components/Layout';
import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges } from '@lib/services/datasourceService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';

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

const ViewFunnel = () => {
  return <Funnel />;
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
