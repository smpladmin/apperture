import Layout from '@components/Layout';
import SettingsOptions from '@components/Settings/SettingsOptions';
import React from 'react';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges } from '@lib/services/datasourceService';
import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import { AppWithIntegrations } from '@lib/domain/app';

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

const SettingsPanel = () => {
  return <SettingsOptions />;
};

SettingsPanel.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default SettingsPanel;
