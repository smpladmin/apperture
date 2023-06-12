import Layout from '@components/Layout';
import Spreadsheet from '@components/Spreadsheet';
import { AppWithIntegrations } from '@lib/domain/app';
import { Workbook } from '@lib/domain/workbook';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getNodes } from '@lib/services/datasourceService';
import { _getSavedWorkbook } from '@lib/services/workbookService';
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
  const savedWorkbook = await _getSavedWorkbook(
    token,
    query.workbookId as string
  );

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedWorkbook) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: { apps, savedWorkbook },
  };
};

const EditWorkbook = ({ savedWorkbook }: { savedWorkbook: Workbook }) => {
  return <Spreadsheet savedWorkbook={savedWorkbook} />;
};

EditWorkbook.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default EditWorkbook;
