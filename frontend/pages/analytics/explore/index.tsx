import Head from 'next/head';
import { ReactNode } from 'react';
import Layout from '@components/Layout';
import { GetServerSideProps } from 'next';
import { _getApps } from '@lib/services/appService';
import { App } from '@lib/domain/app';
import { Flex, Image, Button, Link, Text, Box } from '@chakra-ui/react';
import paper from '@assets/images/longDataPaper.svg';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = req.cookies.auth_token;
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getApps(token);
  if (!apps.length) {
    return {
      redirect: {
        destination: '/analytics/app/create',
      },
      props: {},
    };
  }
  return {
    props: { apps },
  };
};

const Explore = () => {
  return (
    <Box height={'full'} paddingX={{ base: 4, md: 0 }}>
      <Head>
        <title>Apperture</title>
        <meta name="description" content="Apperture Analytics" />
      </Head>
      <Flex
        width={'full'}
        height={'full'}
        direction={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        textAlign={'center'}
        position={'relative'}
      >
        <Image
          src={paper.src}
          pb={10}
          alt="Integration completed"
          w={'18.6rem'}
          h={'auto'}
        />
        <Box width={{ base: 'full', md: 88 }} paddingX={{ base: 4, md: 0 }}>
          <Text
            fontWeight={'bold'}
            fontSize={'sh-28'}
            lineHeight={'sh-28'}
            marginBottom={2}
          >
            Loading your data
          </Text>
          <Text
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
            color={'grey.200'}
          >
            Apperture is fetching data from the original source. This may take
            some time
          </Text>
        </Box>
      </Flex>
    </Box>
  );
};

Explore.getLayout = function getLayout(page: ReactNode, apps: App[]) {
  return <Layout apps={apps}>{page}</Layout>;
};

export default Explore;
