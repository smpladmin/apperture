import { GetServerSideProps } from 'next';
import Head from 'next/head'

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: "/explore",
    },
    props: {},
  };
}

const Home = () => {};

export default Home;
