import dynamic from 'next/dynamic';
// import WorkbookComponent from '@components/Workbook';
const WorkbookComponent = dynamic(() => import('@components/Workbook'), {
  ssr: false,
});

import { Workbook } from '@lib/domain/workbook';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getSavedWorkbook } from '@lib/services/workbookService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';

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

  const savedWorkbook = await _getSavedWorkbook(
    token,
    query.workbookId as string
  );

  if (!savedWorkbook) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: { savedWorkbook },
  };
};

const EditWorkbook = ({ savedWorkbook }: { savedWorkbook: Workbook }) => {
  return <WorkbookComponent savedWorkbook={savedWorkbook} />;
};

export default EditWorkbook;
