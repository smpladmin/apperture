import ViewRetentionComponent from '@components/Retention/ViewRetention';
import Layout from '@components/Layout';
import { AppWithIntegrations } from '@lib/domain/app';
import { Retention } from '@lib/domain/retention';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getSavedRetention } from '@lib/services/retentionService';
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

  const { retentionId, dsId } = query;
  const apps = await _getAppsWithIntegrations(token);
  const savedRetention = await _getSavedRetention(token, retentionId as string);

  const datasourceId = dsId || savedRetention.datasourceId;

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedRetention) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: { apps, savedRetention },
  };
};

const ViewRetention = ({ savedRetention }: { savedRetention: Retention }) => {
  return <ViewRetentionComponent savedRetention={savedRetention} />;
};

ViewRetention.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default ViewRetention;
