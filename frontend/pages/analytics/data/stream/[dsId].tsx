import Layout from '@components/Layout';
import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import ViewDatastream from '@components/DataStream';
import HomeLayout from '@components/HomeLayout';

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

const SanityTables = () => {
  return <ViewDatastream />;
};

SanityTables.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default SanityTables;
