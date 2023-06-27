import CreateRetention from '@components/Retention/CreateRetention';
import Layout from '@components/Layout';
import { MapContext } from '@lib/contexts/mapContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { Retention } from '@lib/domain/retention';
import { Node } from '@lib/domain/node';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getNodes } from '@lib/services/datasourceService';
import { _getSavedRetention } from '@lib/services/retentionService';
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
  const [nodes, savedRetention] = await Promise.all([
    _getNodes(token, query.dsId as string),
    _getSavedRetention(token, query.retentionId as string),
  ]);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedRetention) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: { apps, nodes, savedRetention },
  };
};

const EditRetention = ({
  nodes,
  savedRetention,
}: {
  nodes: Node[];
  savedRetention: Retention;
}) => {
  const { dispatch } = useContext(MapContext);

  useEffect(() => {
    dispatch({
      type: Actions.SET_NODES,
      payload: nodes,
    });
  }, []);

  return <CreateRetention savedRetention={savedRetention} />;
};

export default EditRetention;
