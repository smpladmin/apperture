import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import CreateMetric from '@components/Metric/CreateMetric';
import { _getSavedMetric } from '@lib/services/metricService';
import { Metric } from '@lib/domain/metric';
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
  const { metricId } = query;
  const apps = await _getAppsWithIntegrations(token);
  const savedMetric = await _getSavedMetric(token, metricId as string);

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
    props: { apps, savedMetric },
  };
};

const EditMetric = ({ savedMetric }: { savedMetric: Metric }) => {
  const tranformedMetric = cloneDeep(savedMetric);
  const aggregates = replaceFilterValueWithEmptyStringPlaceholder(
    tranformedMetric.aggregates
  );
  const updatedSavedMetric = { ...savedMetric, aggregates };

  return <CreateMetric savedMetric={updatedSavedMetric} />;
};

EditMetric.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default EditMetric;
