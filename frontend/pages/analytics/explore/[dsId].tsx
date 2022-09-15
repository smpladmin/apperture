import { ReactNode, useState } from 'react';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { _getApps } from '@lib/services/appService';
import { App, AppWithIntegrations } from '@lib/domain/app';
import Loading from '@components/Loading';
import Graph from '@components/Graph';
import Head from 'next/head';
import { _getEdges } from '@lib/services/datasourceService';
import { Edge } from '@lib/domain/edge';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getApps(token);
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

type ExploreDataSourceProps = {
  apps: Array<App>;
  edges: Array<Edge>;
};

const ExploreDataSource = ({ edges }: ExploreDataSourceProps) => {
  const [isLoading] = useState<boolean>(!edges.length);
  return (
    <>
      <Head>
        <title>Apperture</title>
        <meta name="description" content="Apperture Analytics" />
      </Head>
      {isLoading ? <Loading /> : <Graph visualisationData={edges} />}
    </>
  );
};

ExploreDataSource.getLayout = function getLayout(
  page: ReactNode,
  apps: AppWithIntegrations[]
) {
  return <Layout apps={apps}>{page}</Layout>;
};

export default ExploreDataSource;
