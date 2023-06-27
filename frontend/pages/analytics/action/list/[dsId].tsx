import React, { ReactNode } from 'react';
import Actions from '@components/Watchlist/Actions';
import { AppWithIntegrations } from '@lib/domain/app';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { getDatasourceById } from '@lib/utils/common';
import { Provider } from '@lib/domain/provider';

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

const SavedActions = ({ provider }: { provider: Provider }) => {
  return <Actions provider={provider} />;
};

export default SavedActions;
