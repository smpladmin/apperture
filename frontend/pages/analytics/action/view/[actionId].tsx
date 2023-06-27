import React, { ReactNode } from 'react';
import ActionComponent from '@components/Actions/CreateAction';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { AppWithIntegrations } from '@lib/domain/app';
import Layout from '@components/Layout';
import { _getSavedAction } from '@lib/services/actionService';
import { Action } from '@lib/domain/action';

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
  const { actionId } = query;

  const apps = await _getAppsWithIntegrations(token);
  const savedAction = await _getSavedAction(actionId as string, token);

  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedAction) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }
  return {
    props: { apps, savedAction },
  };
};

const EditAction = ({ savedAction }: { savedAction: Action }) => {
  return <ActionComponent savedAction={savedAction} />;
};

export default EditAction;
