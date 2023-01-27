import CreateFunnel from '@components/Funnel/CreateFunnel';
import Layout from '@components/Layout';
import { MapContext } from '@lib/contexts/mapContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { Funnel } from '@lib/domain/funnel';
import { Node } from '@lib/domain/node';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getNodes } from '@lib/services/datasourceService';
import { _getSavedFunnel } from '@lib/services/funnelService';
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
  const [nodes, savedFunnel] = await Promise.all([
    _getNodes(token, query.dsId as string),
    _getSavedFunnel(token, query.funnelId as string),
  ]);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedFunnel) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: { apps, nodes, savedFunnel },
  };
};

const EditFunnel = ({
  nodes,
  savedFunnel,
}: {
  nodes: Node[];
  savedFunnel: Funnel;
}) => {
  const { dispatch } = useContext(MapContext);

  useEffect(() => {
    dispatch({
      type: Actions.SET_NODES,
      payload: nodes,
    });
  }, []);

  return <CreateFunnel savedFunnel={savedFunnel} />;
};

EditFunnel.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default EditFunnel;
