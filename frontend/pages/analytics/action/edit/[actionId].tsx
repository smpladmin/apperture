import React, { ReactNode } from 'react';
import Action from '@components/Actions/CreateAction';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { AppWithIntegrations } from '@lib/domain/app';
import Layout from '@components/Layout';

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

const EditAction = () => {
  return <Action />;
};

EditAction.getLayout = function getLayout(
  page: ReactNode,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default EditAction;
