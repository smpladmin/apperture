import Funnel from '@components/Funnel/CreateFunnel';
import Layout from '@components/Layout';
import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges } from '@lib/services/datasourceService';
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

const CreateFunnel = () => {
  return <Funnel />;
};

CreateFunnel.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default CreateFunnel;
