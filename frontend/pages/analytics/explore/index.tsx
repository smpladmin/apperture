import Head from 'next/head';
import { ReactNode } from 'react';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { _getApps } from '@lib/services/appService';
import { App } from '@lib/domain/app';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getApps(token);
  return {
    props: {
      apps,
    },
  };
};

const Explore = () => {
  return (
    <div>
      <Head>
        <title>Apperture</title>
        <meta name="description" content="Apperture Analytics" />
      </Head>
      <div>
        <h2>Explore</h2>
      </div>
    </div>
  );
};

Explore.getLayout = function getLayout(page: ReactNode, apps: App[]) {
  return <Layout apps={apps}>{page}</Layout>;
};

export default Explore;
