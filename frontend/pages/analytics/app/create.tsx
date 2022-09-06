import { useEffect, useRef, useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Input,
  Text,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { addApp } from '@lib/services/appService';

const Create = () => {
  const [appName, setAppName] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  const handleNextClick = async () => {
    const app = await addApp(appName);
    if (app) {
      router.push(
        `/analytics/app/${encodeURIComponent(app._id)}/integration/select`
      );
    }
  };
  const handleGoBack = () => router.push('/analytics/explore?apps=1');

  return (
    <Flex direction={'column'}>
      <IconButton
        aria-label="close"
        icon={<i className="ri-close-fill" />}
        position={'absolute'}
        rounded={'full'}
        bg={'white.DEFAULT'}
        border={'1px'}
        borderColor={'white.200'}
        top={{ base: '4', md: '20' }}
        left={{ base: '4', md: '45' }}
        onClick={handleGoBack}
      />
      <Box mt={11} w={{ sm: 'full' }} maxW={{ lg: '176' }}>
        <Text
          textColor={'grey.200'}
          pb={6}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'medium'}
        >
          Step 1 of 3
        </Text>
        <Heading
          as={'h2'}
          pb={{ base: 8, lg: 10 }}
          fontSize={{ base: '1.74rem', lg: '3.5rem' }}
          lineHeight={{ base: '2.125rem', lg: '4.125rem' }}
          fontWeight={'semibold'}
        >
          What would you like to name this application?
        </Heading>
        <Input
          size={'lg'}
          width={['100%', '100%', '31.25rem']}
          bg={'white.100'}
          rounded={'0.25rem'}
          fontSize={'base'}
          lineHeight={'base'}
          textColor={'black.DEFAULT'}
          placeholder="Ex- Food Web App"
          py={4}
          px={3.5}
          focusBorderColor={'black.100'}
          border={'0.6px'}
          _placeholder={{
            fontSize: '1rem',
            lineHeight: '1.375rem',
            fontWeight: 400,
            color: 'grey.100',
          }}
          ref={inputRef}
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
        />
      </Box>
      <Button
        mt={10}
        rounded={'lg'}
        bg={'black.100'}
        p={6}
        fontSize={'base'}
        fontWeight={'semibold'}
        lineHeight={'base'}
        textColor={'white.100'}
        w={{ sm: 'full', md: '72' }}
        disabled={!appName}
        onClick={handleNextClick}
        bottom={{ base: '4', md: 'none' }}
      >
        Next
      </Button>
    </Flex>
  );
};

export default Create;
