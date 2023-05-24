import React, { ReactElement } from 'react';
import Spreadsheet from '@components/Spreadsheet';
import { AppWithIntegrations } from '@lib/domain/app';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';

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

const Sheet = () => {
  return <Spreadsheet />;
};

Sheet.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default Sheet;
