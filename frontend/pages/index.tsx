import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/analytics/explore',
    },
    props: {},
  };
};

const Home = () => {};

export default Home;
