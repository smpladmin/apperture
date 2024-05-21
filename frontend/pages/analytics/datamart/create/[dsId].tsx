import React, { ReactElement } from 'react';
import { AppWithIntegrations } from '@lib/domain/app';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import HomeLayout from '@components/HomeLayout';
import { _getAppertureUserInfo } from '@lib/services/userService';
import { AppertureUser } from '@lib/domain/user';
import Scripts from '@components/Scripts';
import { _getSavedDataMartsForDatasourceId } from '@lib/services/dataMartService';
import { DataMartObj } from '@lib/domain/datamart';

export const getServerSideProps: GetServerSideProps = async ({ req, query }) => {
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

  // Fetching saved datamarts to display in drop down
  const datasourceId = query.dsId;
  let savedDataMarts = (await _getSavedDataMartsForDatasourceId(datasourceId as string, token)) || [];

  return {
    props: { apps, user, savedDataMarts },
  };
};

const CreateDataMart = ({ user, savedDataMarts }: { user: AppertureUser; savedDataMarts: DataMartObj[]; }) => {
  const isUserAuthenticatedWithGoogleSheet = !!user.sheetToken;

  return <Scripts isAuthenticated={isUserAuthenticatedWithGoogleSheet} savedDataMarts={savedDataMarts} />;
};

CreateDataMart.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default CreateDataMart;
