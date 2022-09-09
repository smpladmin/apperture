import { ReactNode, useState } from 'react';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { _getApps } from '@lib/services/appService';
import { App } from '@lib/domain/app';
import Loading from '@components/Loading';
import Graph from '@components/Graph';
import Head from 'next/head';
import { visualisationData } from '@lib/data/data';
import { Flex } from '@chakra-ui/react';

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
        <Graph visualisationData={visualisationData} />
      )}
    </>
  );
};

Explore.getLayout = function getLayout(page: ReactNode, apps: App[]) {
  return <Layout apps={apps}>{page}</Layout>;
};

export default Explore;
