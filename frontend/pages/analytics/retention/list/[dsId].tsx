import Layout from '@components/Layout';
import SavedRetentions from '@components/Watchlist/Retention';
import { AppWithIntegrations } from '@lib/domain/app';
import { Provider } from '@lib/domain/provider';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { getDatasourceById } from '@lib/utils/common';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import React, { ReactNode } from 'react';

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
  const datasourceId = query.dsId;
  const provider =
    getDatasourceById(apps, datasourceId as string)?.provider || '';

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { apps, provider },
  };
};

const ListRetentions = ({ provider }: { provider: Provider }) => {
  return <SavedRetentions provider={provider} />;
};

ListRetentions.getLayout = function getLayout(
  page: ReactNode,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default ListRetentions;
