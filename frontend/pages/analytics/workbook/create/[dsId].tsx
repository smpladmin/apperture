import React, { ReactElement } from 'react';
import Spreadsheet from '@components/Spreadsheet';
import { AppWithIntegrations } from '@lib/domain/app';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import HomeLayout from '@components/HomeLayout';
import {
  _getEventProperties,
  _getNodes,
} from '@lib/services/datasourceService';

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

const Sheet = ({ eventProperties }: { eventProperties: string[] }) => {
  return <Spreadsheet />;
};

Sheet.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default Sheet;
