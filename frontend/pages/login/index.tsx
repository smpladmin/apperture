import Head from 'next/head';
import Loginscreen from '@components/Loginscreen';

const Login = () => {
  return (
    <div>
      <Head>
        <title>Apperture | Login</title>
        <meta name="description" content="Apperture Analytics" />
      </Head>
      <Loginscreen />
    </div>
  );
};

export default Login;
