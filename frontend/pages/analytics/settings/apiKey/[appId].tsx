import APIKey from '@components/APIKey';
import HomeLayout from '@components/HomeLayout';
import { App, AppWithIntegrations } from '@lib/domain/app';
import { _getApp, _getAppsWithIntegrations } from '@lib/services/appService';
import { _getAppertureUserInfo } from '@lib/services/userService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import React, { ReactElement } from 'react';

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
  const selectedApp = await _getApp(query.appId as string, token);

  return {
    props: { apps, selectedApp },
  };
};

const ApiKey = ({ selectedApp }: { selectedApp: App }) => {
  return <APIKey app={selectedApp} />;
};

ApiKey.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default ApiKey;
