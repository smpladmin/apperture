import React, { ReactElement } from 'react';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { AppWithIntegrations } from '@lib/domain/app';
import HomeLayout from '@components/HomeLayout';
import Home from '@components/Home';

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

const HomePage = ({ apps }: { apps: AppWithIntegrations[] }) => {
  return <Home apps={apps} />;
};

HomePage.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default HomePage;
