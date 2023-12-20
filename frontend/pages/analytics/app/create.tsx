//create
import { useEffect, useRef, useState } from 'react';
import 'remixicon/fonts/remixicon.css';
import {
  Box,
  Button,
  Flex,
  Heading,
  Input,
  Text,
  useToast,
  Checkbox,
  Link,
} from '@chakra-ui/react';
import { useRouter } from 'next/router';
import { addApp } from '@lib/services/appService';
import { ErrorResponse } from '@lib/services/util';
import {
  TopProgress0,
  IntegrationContainer,
  LeftContainer,
  RightContainer,
} from '@components/Onboarding';

const Create = () => {
  const toast = useToast();
  const [appName, setAppName] = useState<string>('');
  const [isAgreementChecked, setIsAgreementChecked] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const router = useRouter();
  const { previousDsId } = router.query;

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  const handleNextClick = async () => {
    const res = await addApp(appName);

    if (res.status === 200) {
      router.push({
        pathname: `/analytics/app/[appId]/integration/select`,
        query: { appId: res.data._id, ...router.query },
      });
    } else {
      toast({
        title: (res as ErrorResponse).error.detail,
        status: 'error',
        variant: 'subtle',
        isClosable: true,
      });
    }
  };
  const handleGoBack = () =>
    router.push({
      pathname: `/analytics/home/[dsId]`,
      query: { dsId: previousDsId, apps: 1 },
    });
  const handleAgreementCheckboxChange = () => {
    setIsAgreementChecked(!isAgreementChecked);
  };

  return (
    <IntegrationContainer>
      <LeftContainer />

      <RightContainer>
        <Flex flexDirection="column" alignItems="center">
          <TopProgress0 handleGoBack={handleGoBack} />
          <Flex
            direction={'column'}
            h={'full'}
            justifyContent={{ base: 'space-between', md: 'start' }}
          >
            <Box width={120} mt={20}>
              <Heading
                as="h3"
                fontSize="sh-36"
                fontWeight="bold"
                mb={6}
                textAlign="center"
              >
                What do you want to call your workspace?
              </Heading>
            </Box>
            <Input
              mt={20}
              size="lg"
              width={['100%', '100%', '31.25rem']}
              bg="white.500"
              rounded={10}
              fontSize="base"
              fontWeight={{ base: '400', md: '500' }}
              lineHeight="base"
              height={{ base: '12', md: '15' }}
              textColor="black.400"
              placeholder="Ex- Food Web App"
              py={4}
              px={3.5}
              // focusBorderColor="grey.900"
              borderWidth={'2px'}
              borderRadius={'20'}
              borderColor={'white.200'}
              // boxShadow="0px 2px 4px rgba(0, 0, 0, 0.1)"
              _placeholder={{
                fontSize: '1rem',
                lineHeight: '1.375rem',
                fontWeight: 400,
                color: 'gray.500',
              }}
              ref={inputRef}
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
            />
            <Flex flexDirection="row" alignItems="center" mt={15}>
              <Checkbox
                colorScheme={'radioBlack'}
                isChecked={isAgreementChecked}
                onChange={handleAgreementCheckboxChange}
              />
              <Text
                fontSize={{ base: 'xs-14', md: 'xs-14' }}
                lineHeight={{ base: 'sh-18', md: 'sh-18' }}
                fontWeight="normal"
                color="grey.800"
                ml={2}
              >
                I agree to the{' '}
                <Link
                  href="https://apperture.io/end-user-agreement"
                  textDecoration="underline"
                >
                  {' '}
                  user agreement policies
                </Link>
                .
              </Text>
            </Flex>
            <Button
              variant="primary"
              mt={6}
              rounded="lg"
              bg="black.100"
              p={6}
              fontSize="base"
              fontWeight="semibold"
              lineHeight="base"
              textColor="white.100"
              width={{ base: 'full', md: '72' }}
              isDisabled={!appName || !isAgreementChecked}
              onClick={handleNextClick}
            >
              Next
            </Button>
          </Flex>
        </Flex>
      </RightContainer>
    </IntegrationContainer>
  );
};

export default Create;
