import { GetServerSideProps } from 'next';

const Explore = () => {};

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/',
    },
    props: {},
  };
};

export default Explore;
