import Funnel from '@components/Funnel/CreateFunnel';
import Layout from '@components/Layout';
import { MapContext } from '@lib/contexts/mapContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getNodes } from '@lib/services/datasourceService';
import { Actions } from '@lib/types/context';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';
import { ReactElement, useContext, useEffect } from 'react';
import { Node } from '@lib/domain/node';

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

const CreateFunnel = ({ nodes }: { nodes: Node[] }) => {
  const { dispatch } = useContext(MapContext);

  useEffect(() => {
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
