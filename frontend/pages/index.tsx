import type { GetServerSideProps } from 'next'
import Head from 'next/head'
import { useEffect, useState } from 'react';
import { getTests, getTestsV2 } from '../lib/services/testService';

export const getServerSideProps: GetServerSideProps = async () => {
  const tests = await getTests();
  return {
    props: {
      tests
    },
  };
};

const Home = (props: {tests: Array<{id: string; name: string}>}) => {

  const [testsV2, setTestsV2] = useState<Array<{id: string; name: string}>>([]);

  useEffect(() => {
    getTestsV2().then(t => {
      setTestsV2(t)
    });
  }, []);

  return (
    <div>
      <Head>
        <title>Apperture</title>
        <meta name="description" content="Apperture Analytics" />
      </Head>
      <div>
        <h2>
          Testing Apperture | MVP
        </h2>
        <p>
          This data came from the backend and was rendered on the server
        </p>
        <div>
          {props.tests.map(t => {
            return <p key={t.id}>{t.id} - {t.name}</p>
          })}
        </div>
      </div>
      <div>
        <p>
          This data came from the backend and was rendered on the browser
        </p>
        <div>
          {testsV2.map(t => {
            return <p key={t.id}>{t.id} - {t.name}</p>
          })}
        </div>
      </div>
    </div>
  )
}

export default Home
