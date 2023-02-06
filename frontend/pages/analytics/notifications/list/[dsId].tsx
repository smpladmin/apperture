import Layout from '@components/Layout';
import SavedNotifications from '@components/Watchlist/Notifications';
import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import React, { ReactNode } from 'react';

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

const ListNotifications = () => {
  return <SavedNotifications />;
};

ListNotifications.getLayout = function getLayout(
  page: ReactNode,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default ListNotifications;
