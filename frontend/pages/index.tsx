import { Provider } from '@lib/domain/provider';
import { _getApps, _getAppsWithIntegrations } from '@lib/services/appService';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = req.cookies.auth_token;
  const apps = await _getAppsWithIntegrations(token!!);
  const noAppsCreated = !apps.length;
  if (noAppsCreated) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  const oneAppWithoutIntegration =
    apps.length === 1 && !apps[0].integrations.length;
  if (oneAppWithoutIntegration) {
    return {
      redirect: {
        destination: `/analytics/app/${apps[0]._id}/integration/select`,
      },
      props: {},
    };
  }
  const onlyGAIntegrationWithoutDataSource =
    apps.length === 1 &&
    apps[0].integrations.length === 1 &&
    apps[0].integrations[0].provider === Provider.GOOGLE &&
    !apps[0].integrations[0].datasources.length;

  if (onlyGAIntegrationWithoutDataSource) {
    return {
      redirect: {
        destination: `/analytics/app/${apps[0]._id}/integration/${apps[0].integrations[0].provider}/apps?integration_id=${apps[0].integrations[0]._id}`,
      },
      props: {},
    };
  }
  return {
    redirect: {
      destination: '/analytics/explore',
    },
    props: {},
  };
};

const Home = () => {};

export default Home;
