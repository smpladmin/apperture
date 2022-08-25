import Head from 'next/head';
import { ReactNode } from 'react';
import Layout from '../../components/Layout';

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

Explore.getLayout = function getLayout(page: ReactNode) {
  return <Layout>{page}</Layout>;
};

export default Explore;
