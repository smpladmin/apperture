import { GetServerSideProps } from 'next';

const Home = () => {};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/',
    },
    props: {},
  };
};

export default Home;
