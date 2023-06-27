import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import ViewMetric from '@components/Metric/ViewMetric';
import { _getSavedMetric } from '@lib/services/metricService';
import { Metric } from '@lib/domain/metric';
import { _getNotificationByReference } from '@lib/services/notificationService';
import { Notifications } from '@lib/domain/notification';
import { cloneDeep } from 'lodash';
import { replaceFilterValueWithEmptyStringPlaceholder } from '@components/Metric/util';
import HomeLayout from '@components/HomeLayout';

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
  const { metricId, dsId } = query;
  const apps = await _getAppsWithIntegrations(token);
  const savedMetric: Metric = await _getSavedMetric(token, metricId as string);

  const datasourceId = dsId || savedMetric.datasourceId;
  const savedNotification =
    (await _getNotificationByReference(
      token,
      metricId as string,
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
  if (!savedMetric) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }
  return {
    props: { apps, savedMetric, savedNotification },
  };
};

const MetricView = ({
  savedMetric,
  savedNotification,
}: {
  savedMetric: Metric;
  savedNotification: Notifications;
}) => {
  const tranformedMetric = cloneDeep(savedMetric);
  const aggregates = replaceFilterValueWithEmptyStringPlaceholder(
    tranformedMetric.aggregates
  );
  const updatedSavedMetric = { ...savedMetric, aggregates };
  return (
    <ViewMetric
      savedMetric={updatedSavedMetric}
      savedNotification={savedNotification}
    />
  );
};

MetricView.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default MetricView;
