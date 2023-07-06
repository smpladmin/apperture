import HomeLayout from '@components/HomeLayout';
import Spreadsheet from '@components/Spreadsheet';
import { MapContext } from '@lib/contexts/mapContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { Node } from '@lib/domain/node';
import { Workbook } from '@lib/domain/workbook';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getNodes } from '@lib/services/datasourceService';
import { _getSavedWorkbook } from '@lib/services/workbookService';
import { Actions } from '@lib/types/context';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement, useContext, useEffect } from 'react';

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
  const nodes = await _getNodes(token, query.dsId as string);

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
    props: { apps, savedWorkbook, nodes },
  };
};

const EditWorkbook = ({
  savedWorkbook,
  nodes,
}: {
  savedWorkbook: Workbook;
  nodes: Node[];
}) => {
  const { dispatch } = useContext(MapContext);

  useEffect(() => {
    dispatch({
      type: Actions.SET_NODES,
      payload: nodes,
    });
  }, []);
  return <Spreadsheet savedWorkbook={savedWorkbook} />;
};

EditWorkbook.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default EditWorkbook;
