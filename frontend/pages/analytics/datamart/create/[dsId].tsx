import React, { ReactElement } from 'react';
import { AppWithIntegrations } from '@lib/domain/app';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import HomeLayout from '@components/HomeLayout';
import { _getAppertureUserInfo } from '@lib/services/userService';
import { AppertureUser } from '@lib/domain/user';
import Scripts from '@components/Scripts';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getAuthToken(req);
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getAppsWithIntegrations(token);
  const user = await _getAppertureUserInfo(token);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { apps, user },
  };
};

const CreateDataMart = ({ user }: { user: AppertureUser }) => {
  const isUserAuthenticatedWithGoogleSheet = !!user.sheetToken;

  return <Scripts isAuthenticated={isUserAuthenticatedWithGoogleSheet} />;
};

CreateDataMart.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default CreateDataMart;
