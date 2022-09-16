import { ReactNode, useState } from 'react';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { _getApps } from '@lib/services/appService';
import { AppWithIntegrations } from '@lib/domain/app';
import Loading from '@components/Loading';
import Graph from '@components/Graph';
import Head from 'next/head';
import { visualisationData } from '@lib/data/data';
import { Edge } from '@lib/domain/edge';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getApps(token);
  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { apps },
  };
};

const Explore = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  return (
    <>
      <Head>
        <title>Apperture</title>
        <meta name="description" content="Apperture Analytics" />
      </Head>
      {isLoading ? (
        <Loading />
      ) : (
        <Graph
          visualisationData={visualisationData as unknown as Array<Edge>}
        />
      )}
    </>
  );
};

Explore.getLayout = function getLayout(
  page: ReactNode,
  apps: AppWithIntegrations[]
) {
  return <Layout apps={apps}>{page}</Layout>;
};

export default Explore;
