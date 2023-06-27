import HomeLayout from '@components/HomeLayout';
import SavedFunnels from '@components/Watchlist/Funnels';
import { AppWithIntegrations } from '@lib/domain/app';
import { Provider } from '@lib/domain/provider';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { getDatasourceById } from '@lib/utils/common';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import React, { ReactElement, ReactNode } from 'react';

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

const ListFunnels = ({ provider }: { provider: Provider }) => {
  return <SavedFunnels provider={provider} />;
};

ListFunnels.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};
export default ListFunnels;
