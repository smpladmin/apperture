import { AppWithIntegrations } from '@lib/domain/app';
import { Provider } from '@lib/domain/provider';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';

const checkDataSource = (apps: Array<AppWithIntegrations>) => {
  const dsId = apps[0]?.integrations[0]?.datasources[0]?._id;
  if (dsId) {
    return {
      redirect: {
        destination: `/analytics/home/${dsId}`,
      },
      props: {},
    };
  }
};

const checkNoAppsCreated = (apps: Array<AppWithIntegrations>) => {
  const noAppsCreated = !apps.length;
  if (noAppsCreated) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
};

const checkOneAppWithoutIntegration = (apps: Array<AppWithIntegrations>) => {
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
};

const checkOnlyGAIntegrationWithoutDataSource = (
  apps: Array<AppWithIntegrations>
) => {
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
};

const four0four = () => {
  return {
    redirect: {
      destination: '/404',
    },
    props: {},
  };
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getAuthToken(req);
  const apps = await _getAppsWithIntegrations(token!!);
  return (
    checkDataSource(apps) ||
    checkNoAppsCreated(apps) ||
    checkOneAppWithoutIntegration(apps) ||
    checkOnlyGAIntegrationWithoutDataSource(apps) ||
    four0four()
  );
};

const Home = () => {};

export default Home;
