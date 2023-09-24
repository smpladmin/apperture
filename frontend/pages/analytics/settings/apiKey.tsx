import APIKey from '@components/APIKey';
import HomeLayout from '@components/HomeLayout';
import { AppWithIntegrations } from '@lib/domain/app';
import { AppertureUser } from '@lib/domain/user';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getAppertureUserInfo } from '@lib/services/userService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import React, { ReactElement } from 'react';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getAuthToken(req);
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getAppsWithIntegrations(token);
  const user = await _getAppertureUserInfo(token);
  return {
    props: { user, apps },
  };
};

const ApiKey = ({ user }: { user: AppertureUser }) => {
  return <APIKey user={user} />;
};

ApiKey.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default ApiKey;
