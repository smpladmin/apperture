import Layout from '@components/Layout';
import CreateSegment from '@components/Segments/CreateSegment';
import { replaceFilterValueWithEmptyStringPlaceholder } from '@components/Segments/util';
import { AppWithIntegrations } from '@lib/domain/app';
import { Segment } from '@lib/domain/segment';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getSavedSegment } from '@lib/services/segmentService';
import { getAuthToken } from '@lib/utils/request';
import { cloneDeep } from 'lodash';
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

  const { segmentId } = query;
  const apps = await _getAppsWithIntegrations(token);
  const savedSegment = await _getSavedSegment(token, segmentId as string);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedSegment) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }
  return {
    props: { apps, savedSegment },
  };
};

const EditSegments = ({ savedSegment }: { savedSegment: Segment }) => {
  const transformSavedSegmentGroups =
    replaceFilterValueWithEmptyStringPlaceholder(
      cloneDeep(savedSegment.groups)
    );

  const transformSavedSegment = {
    ...savedSegment,
    groups: transformSavedSegmentGroups,
  };

  console.log(transformSavedSegment);
  return <CreateSegment savedSegment={transformSavedSegment} />;
};

EditSegments.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};
export default EditSegments;
