import HomeLayout from '@components/HomeLayout';
import Scripts from '@components/Scripts';
import { AppWithIntegrations } from '@lib/domain/app';
import { DataMartObj } from '@lib/domain/datamart';
import { DatamartAction } from '@lib/domain/datamartActions';
import { AppertureUser } from '@lib/domain/user';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getSavedDataMart, _getSavedDataMartsForDatasourceId } from '@lib/services/dataMartService';
import { _getSavedDatamartActionsForDatamartId } from '@lib/services/datamartActionService';
import { _getNodes } from '@lib/services/datasourceService';
import { _getAppertureUserInfo } from '@lib/services/userService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';

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
  const user = await _getAppertureUserInfo(token);

  const savedDataMart = await _getSavedDataMart(
    token,
    query.dataMartId as string
  );
  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  const savedDatamartActions = await _getSavedDatamartActionsForDatamartId(
    savedDataMart._id,
    token
  );

  if (!savedDataMart) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  // Fetching saved datamarts to display in drop down
  const datasourceId = query.dsId;
  let savedDataMarts = (await _getSavedDataMartsForDatasourceId(datasourceId as string, token)) || [];
  
  // Removing current datamart from drop down (savedDataMarts list) 
  const currentDataMartId = query.dataMartId;
  savedDataMarts = savedDataMarts.filter((dataMart: DataMartObj) => dataMart._id !== currentDataMartId);

  return {
    props: { apps, savedDataMart, savedDatamartActions, user, savedDataMarts },
  };
};

const EditDataMart = ({
  savedDataMart,
  savedDatamartActions,
  user,
  savedDataMarts,
}: {
  savedDataMart: DataMartObj;
  savedDatamartActions: DatamartAction[];
  user: AppertureUser;
  savedDataMarts: DataMartObj[];
}) => {
  const isUserAuthenticatedWithGoogleSheet = !!user.sheetToken;

  return (
    <Scripts
      savedDatamart={savedDataMart}
      savedDatamartActions={savedDatamartActions}
      isAuthenticated={isUserAuthenticatedWithGoogleSheet}
      savedDataMarts={savedDataMarts}
    />
  );
};

EditDataMart.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default EditDataMart;
