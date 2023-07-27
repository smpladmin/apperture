import { Box, Flex, IconButton, Text, Heading } from '@chakra-ui/react';
import Image from 'next/image';
import gaLogo from '@assets/images/ga-logo.svg';
import 'remixicon/fonts/remixicon.css';
import FormButton from '@components/FormButton';
import { BACKEND_BASE_URL, FRONTEND_BASE_URL } from 'config';
import logo from '@assets/images/AppertureWhiteLogo.svg';
import { useRouter } from 'next/router';
import onboarding_left_panel from '@assets/images/onboarding_left_panel.svg';
import {
  TopProgress,
  IntegrationContainer,
  LeftContainer,
  RightContainer,
  LeftContainerRevisit,
} from '@components/Onboarding';

type GooglePermissionProps = {
  navigateBack: Function;
  handleClose: Function;
  add: string | string[] | undefined;
  query: {
    [key in string]: string | string[] | undefined;
  };
};

const GooglePermission = ({
  navigateBack,
  handleClose,
  query,
  add,
}: GooglePermissionProps) => {
  const link = `${BACKEND_BASE_URL}/integrations/oauth/google?app_id=${query.appId}&redirect_url=${FRONTEND_BASE_URL}/analytics/app/${query.appId}/integration/google/apps`;
  const oauthUrl =
    query.add && query.previousDsId
      ? link.concat(`?add=true&previousDsId=${query.previousDsId}`)
      : query.previousDsId
      ? link.concat(`?previousDsId=${query.previousDsId}`)
      : link;
  const router = useRouter();
  const handleGoBack = (): void => router.back();

  return (
    <IntegrationContainer>
      
        { add ? <LeftContainerRevisit/> : <LeftContainer /> }
     
      <RightContainer>
          <Flex flexDirection="column" alignItems="center">
             { add ? <Box mt={10}></Box> : <TopProgress handleGoBack={handleGoBack} /> }

            <Flex direction="column" h="full" justifyContent="center" alignItems="center" mt={10}>
              <Box height={{ base: 8, md: 14 }} width={{ base: 8, md: 14 }} mb={10}>
                <Image src={gaLogo} alt="google analytics" layout="responsive" />
              </Box>
              <Box maxWidth="82" paddingX="4" justifyContent="center">
                <Text fontWeight="semibold" fontSize="sh-24" lineHeight="sh-24" marginBottom="2">
                  Permission Request
                </Text>
                <Text
                  fontSize={{ base: 'xs-14', md: 'base' }}
                  lineHeight={{ base: 'xs-14', md: 'base' }}
                  color="grey.200"
                  fontWeight="normal"
                >
                  Apperture wants to connect with your Google Analytics account
                </Text>
                <Box mt="12">
                  <FormButton navigateBack={navigateBack} link={oauthUrl} nextButtonName="Give Access" />
                </Box>
              </Box>
            </Flex>
          </Flex>
        </RightContainer>
    </IntegrationContainer>
  );
};

export default GooglePermission;
