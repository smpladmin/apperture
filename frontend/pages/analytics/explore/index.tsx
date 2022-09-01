import Head from 'next/head';
import { ReactNode } from 'react';
import Layout from '@components/Layout';
import mobile from 'is-mobile';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const isMobile = mobile({ ua: req });
  return {
    props: {
      isMobile,
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

Explore.getLayout = function getLayout(page: ReactNode, isMobile: boolean) {
  return <Layout isMobile={isMobile}>{page}</Layout>;
};

export default Explore;
