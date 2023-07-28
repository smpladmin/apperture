import { Image, Flex, Box, Text, Button } from '@chakra-ui/react';
import folder from '@assets/images/folder.svg';
import { GetServerSideProps } from 'next';
import { _getApp } from '@lib/services/appService';
import { App } from '@lib/domain/app';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { getAuthToken } from '@lib/utils/request';
import React, { useState, useRef } from 'react';
import { Clipboard, CheckCircle} from 'phosphor-react';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const app = await _getApp(query.appId as string, getAuthToken(req) as string);
  return {
    props: { app },
  };
};

type CompleteIntegrationProps = {
  app: App;
};



const CompleteIntegration = ({ app }: CompleteIntegrationProps) => {
  const [code, setCode] = useState('');
  const router = useRouter();
  const codeAreaRef = useRef(null);
  
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
      {router.query.provider === "apperture" ? <Text
              fontWeight={'bold'}
              fontSize={'sh-28'}
              lineHeight={'sh-28'}
              marginBottom={'2'}
              color='grey.800'
              mb={10}
            >
              Simply Copy this script to your website header.
            </Text>
        :
        <CheckCircle size={52}  weight="fill" color='GREEN'/>
        // <Image
        //   src={folder.src}
        //   pb={10}
        //   alt="Integration completed"
        //   w={39}
        //   h={'auto'}
        // />
      }
        {router.query.provider === "apperture" ? 
            <textarea
            ref={codeAreaRef}
            rows={6}
            cols={100}
            value= {`<script>!function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.async=!0,p.src=s.api_host+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);posthog.init('${router.query.dsId}', {api_host: 'https://api.apperture.io/events/capture'})</script>`}
            readOnly
            style={{ resize: 'none', fontSize: '11px', background: '#efefef', borderStyle:'solid',
                  borderWidth: '2px', borderRadius: '10px', color: '#212121', padding: '5px'
                  }}
            p-5
          /> 

          :<Box></Box>}

      
        
        {router.query.provider === "apperture" ? <Box></Box>
        :
          <Box maxW={'600'} w={'full'}>
            <Text
              fontWeight={'bold'}
              fontSize={'sh-28'}
              lineHeight={'sh-28'}
              marginBottom={'2'}
              pt={10}
            >
              Datasource added sucessfully!
            </Text>
            <Text
              fontSize={{ base: 'xs-14', md: 'base' }}
              lineHeight={{ base: 'xs-14', md: 'base' }}
              color={'grey.200'}
            >
              Analyse data to take better and informed decisions. You can start with our “Sheets” feature
            </Text>
          </Box>
        }
      </Flex>
      <Box w={'full'} marginX="auto" maxW={70} mt={12}>
        <Link href={`/analytics/home/${router.query.dsId}`}>
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
            {router.query.provider === "apperture" ? "Next" : "Start Exploring" }
          </Button>
        </Link>
        <Link href={`/analytics/home/${router.query.dsId}`}>
          <Text
            cursor={'pointer'}
            pt={'4'}
            decoration={'underline'}
            fontWeight={'500'}
            fontSize={'base'}
            lineHeight={'base'}
          >
             {router.query.provider === "apperture" ? "I have a mobile app" : "Go to Home" }
          </Text>
        </Link>
      </Box>
    </Flex>
  );
};

export default CompleteIntegration;
