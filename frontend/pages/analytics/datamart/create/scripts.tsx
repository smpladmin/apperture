import Scripts from '@components/Scripts';
import React, { ReactElement } from 'react';
import { AppWithIntegrations } from '@lib/domain/app';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import HomeLayout from '@components/HomeLayout';

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

const AppertureScripts = () => {
  return <Scripts />;
};

AppertureScripts.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default AppertureScripts;
