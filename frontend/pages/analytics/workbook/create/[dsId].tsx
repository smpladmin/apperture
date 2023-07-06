import React, { ReactElement, useContext, useEffect } from 'react';
import Spreadsheet from '@components/Spreadsheet';
import { AppWithIntegrations } from '@lib/domain/app';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import HomeLayout from '@components/HomeLayout';
import { _getNodes } from '@lib/services/datasourceService';
import { Node } from '@lib/domain/node';
import { Actions } from '@lib/types/context';
import { MapContext } from '@lib/contexts/mapContext';

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
  const nodes = await _getNodes(token, query.dsId as string);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { apps, nodes },
  };
};

const Sheet = ({ nodes }: { nodes: Node[] }) => {
  const { dispatch } = useContext(MapContext);

  useEffect(() => {
    dispatch({
      type: Actions.SET_NODES,
      payload: nodes,
    });
  }, []);

  return <Spreadsheet />;
};

Sheet.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return <HomeLayout apps={apps}>{page}</HomeLayout>;
};

export default Sheet;
