import DataMart from '@components/DataMart/CreateDataMart';
import Layout from '@components/Layout';
import { MapContext } from '@lib/contexts/mapContext';
import { AppWithIntegrations } from '@lib/domain/app';
import { DataMartObj } from '@lib/domain/datamart';
import { Node } from '@lib/domain/node';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { _getSavedDataMart } from '@lib/services/dataMartService';
import { _getNodes } from '@lib/services/datasourceService';
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
  const savedDataMart = await _getSavedDataMart(
    token,
    query.dataMartId as string
  );
  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }

  if (!savedDataMart) {
    return {
      redirect: {
        destination: '/404',
      },
      props: {},
    };
  }

  return {
    props: { apps, savedDataMart },
  };
};

const EditDataMart = ({ savedDataMart }: { savedDataMart: DataMartObj }) => {
  return <DataMart savedDataMart={savedDataMart} />;
};

EditDataMart.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default EditDataMart;
