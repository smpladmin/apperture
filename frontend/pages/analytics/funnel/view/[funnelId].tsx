import ViewFunnelComponent from '@components/Funnel/ViewFunnel';
import HomeLayout from '@components/HomeLayout';
import { AppWithIntegrations } from '@lib/domain/app';
import { Funnel } from '@lib/domain/funnel';
import { Notifications } from '@lib/domain/notification';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getSavedFunnel } from '@lib/services/funnelService';
import { _getNotificationByReference } from '@lib/services/notificationService';
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

  const { funnelId, dsId } = query;
  const apps = await _getAppsWithIntegrations(token);
  const savedFunnel = await _getSavedFunnel(token, funnelId as string);

  const datasourceId = dsId || savedFunnel.datasourceId;
  const savedNotification =
    (await _getNotificationByReference(
      token,
      funnelId as string,
      datasourceId as string
    )) || {};

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedFunnel) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: { apps, savedFunnel, savedNotification },
  };
};

const ViewFunnel = ({
  savedFunnel,
  savedNotification,
}: {
  savedFunnel: Funnel;
  savedNotification: Notifications;
}) => {
  return (
    <ViewFunnelComponent
      savedFunnel={savedFunnel}
      savedNotification={savedNotification}
    />
  );
};
ViewFunnel.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default ViewFunnel;
