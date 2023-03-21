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
  const { previousDsId } = router.query;

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  const handleNextClick = async () => {
    const app = await addApp(appName);
    if (app) {
      router.push({
        pathname: `/analytics/app/[appId]/integration/select`,
        query: { appId: app._id, ...router.query },
      });
    }
  };
  const handleGoBack = () =>
    router.push({
      pathname: `/analytics/explore/[dsId]`,
      query: { dsId: previousDsId, apps: 1 },
    });

  return (
    <Flex
      flexDirection={'column'}
      h={'full'}
      py={{ base: 4, md: 10 }}
      pl={{ base: 4, md: 45 }}
      pr={{ base: 4, md: 'auto' }}
      justifyContent={{ base: 'space-between', md: 'start' }}
    >
      <Box>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white'}
          border={'1px'}
          borderColor={'white.200'}
          onClick={handleGoBack}
        />
        <Box mt={11} width={{ base: 'full' }} maxW={{ md: '176' }}>
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
            pb={{ base: 8, md: 10 }}
            fontSize={{ base: 'sh-28', md: 'sh-56' }}
            lineHeight={{ base: 'sh-28', md: 'sh-56' }}
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
            fontWeight={{ base: '400', md: '500' }}
            lineHeight={'base'}
            height={{ base: '12', md: '15' }}
            textColor={'black.400'}
            placeholder="Ex- Food Web App"
            py={4}
            px={3.5}
            focusBorderColor={'black.100'}
            border={'0.15'}
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
      </Box>
      <Button
        variant={'primary'}
        mt={10}
        rounded={'lg'}
        bg={'black.100'}
        p={6}
        fontSize={'base'}
        fontWeight={'semibold'}
        lineHeight={'base'}
        textColor={'white.100'}
        width={{ base: 'full', md: '72' }}
        disabled={!appName}
        onClick={handleNextClick}
      >
        Next
      </Button>
    </Flex>
  );
};

export default Create;
