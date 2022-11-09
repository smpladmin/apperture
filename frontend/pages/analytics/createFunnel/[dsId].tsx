import Funnel from '@components/Funnel/CreateFunnel';
import Layout from '@components/Layout';
import { MapContext } from '@lib/contexts/mapContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getEdges } from '@lib/services/datasourceService';
import { Actions } from '@lib/types/context';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement, useContext, useEffect } from 'react';
import { transformData } from '@components/Graph/transformData';

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
  const edges = await _getEdges(token, query.dsId as string);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { apps, edges },
  };
};

const CreateFunnel = ({ edges }: any) => {
  const { dispatch } = useContext(MapContext);

  useEffect(() => {
    const { nodes } = transformData(edges);
    dispatch({
      type: Actions.SET_NODES,
      payload: nodes,
    });
  }, []);

  return <Funnel />;
};

CreateFunnel.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default CreateFunnel;
