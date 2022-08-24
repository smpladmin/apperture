import { GetServerSideProps } from 'next';
import Head from 'next/head'
import { isValidToken } from '../lib/services/authService';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const uri = isValidToken(req.cookies.auth_token) ? "/explore" : "/login"
  return {
    redirect: {
      destination: uri,
    },
    props: {},
  };
}

const Home = () => {

  return (
    <div>
      <Head>
        <title>Apperture</title>
        <meta name="description" content="Apperture Analytics" />
      </Head>

      <div>
        <h2>
          Apperture
        </h2>
      </div>
    </div>
  );
};

export default Home;
