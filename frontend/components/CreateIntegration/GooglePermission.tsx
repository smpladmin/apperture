import { Box, Button, Flex, IconButton, Text } from '@chakra-ui/react';
import Image from 'next/image';
import Link from 'next/link';
import gaLogo from '@assets/images/ga-logo.svg';
import 'remixicon/fonts/remixicon.css';
import FormButton from '@components/FormButton';

type GooglePermissionProps = {
  navigateBack: Function;
  handleClose: Function;
  appId: string | string[] | undefined;
};

const GooglePermission = ({
  navigateBack,
  handleClose,
  appId,
}: GooglePermissionProps) => {
  return (
    <Flex direction={'column'}>
      <Box p={4} px={{ md: 45 }} pt={{ md: 10 }}>
        <IconButton
          aria-label="close"
          variant={'secondary'}
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white.DEFAULT'}
          border={'1px'}
          borderColor={'white.200'}
          onClick={() => handleClose()}
        />
      </Box>
      <Flex
        width={'full'}
        direction={'column'}
        justifyContent={'center'}
        alignItems={'center'}
        textAlign={'center'}
        mt={{ base: '30', md: '20' }}
      >
        <Box
          height={{ base: '20', md: '20' }}
          width={{ base: '20', md: '20' }}
          marginBottom={{ base: '13', md: '8' }}
        >
          <Image src={gaLogo} alt="google analytics" layout="responsive" />
        </Box>
        <Box maxWidth={'82'} paddingX={'4'}>
          <Text
            fontWeight={'semibold'}
            fontSize={'sh-24'}
            lineHeight={'sh-24'}
            marginBottom={'2'}
          >
            Permission Request
          </Text>
          <Text
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
            color={'grey.200'}
            fontWeight={'normal'}
          >
            Apperture wants to connect with your Google Analytics account
          </Text>
          <Box mt={'12'}>
            <FormButton
              navigateBack={navigateBack}
              link={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/integrations/oauth/google?app_id=${appId}&redirect_url=${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/analytics/app/${appId}/integration/google/apps`}
              nextButtonName={'Give Access'}
            />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default GooglePermission;
