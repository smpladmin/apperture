import { Image, Flex, Box, Text, Button } from '@chakra-ui/react';
import folder from '@assets/images/folder.svg';
import { GetServerSideProps } from 'next';
import { _getApp } from '@lib/services/appService';
import { App } from '@lib/domain/app';
import Link from 'next/link';
import { useRouter } from 'next/router';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const app = await _getApp(
    query.appId as string,
    req.cookies.auth_token as string
  );
  return {
    props: { app },
  };
};

type CompleteIntegrationProps = {
  app: App;
};

const CompleteIntegration = ({ app }: CompleteIntegrationProps) => {
  const router = useRouter();
  return (
    <Flex
      width={'full'}
      direction={'column'}
      justifyContent={{ base: 'space-between', md: 'center' }}
      alignItems={'center'}
      textAlign={'center'}
      pt={{ base: 55, md: 0 }}
      pb={{ base: 4, md: 0 }}
      px={{ base: 4, md: 0 }}
    >
      <Flex direction={'column'} alignItems={'center'}>
        <Image
          src={folder.src}
          pb={10}
          alt="Integration completed"
          w={39}
          h={'auto'}
        />
        <Box maxW={'xs'} w={'full'}>
          <Text
            fontWeight={'bold'}
            fontSize={'sh-28'}
            lineHeight={'sh-28'}
            marginBottom={'2'}
          >
            We are all set!
          </Text>
          <Text
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
            color={'grey.200'}
          >
            “{app.name}” has been created and added to your applications.
          </Text>
        </Box>
      </Flex>
      <Box w={'full'} marginX="auto" maxW={70} mt={12}>
        <Link href={`/analytics/explore/${router.query.dsId}`}>
          <Button
            variant={'primary'}
            rounded={'lg'}
            bg={'black.100'}
            p={6}
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
            fontWeight={'semibold'}
            textColor={'white.100'}
            w={'full'}
          >
            Explore
          </Button>
        </Link>
        <Link href={'/analytics/explore'}>
          <Text
            cursor={'pointer'}
            pt={'4'}
            decoration={'underline'}
            fontWeight={'500'}
            fontSize={'base'}
            lineHeight={'base'}
          >
            Go to Home
          </Text>
        </Link>
      </Box>
    </Flex>
  );
};

export default CompleteIntegration;
