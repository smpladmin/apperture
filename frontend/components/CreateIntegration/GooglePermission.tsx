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
              buttonText={'Give Access'}
            />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default GooglePermission;

{
  /* <Flex
            alignItems={'center'}
            justifyContent={'center'}
            gap={'2'}
            mt={'16'}
          >
            <IconButton
              aria-label="back"
              icon={<i className="ri-arrow-left-line"></i>}
              rounded={'lg'}
              bg={'white.100'}
              p={6}
              w={'13'}
              onClick={() => navigateBack()}
            />
            <Link
              href={`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/integrations/oauth/google?app_id=${appId}&redirect_url=${process.env.NEXT_PUBLIC_FRONTEND_BASE_URL}/analytics/app/${appId}/integration/google/apps`}
            >
              <Button
                rounded={'lg'}
                bg={'black.100'}
                p={6}
                fontSize={'base'}
                fontWeight={'semibold'}
                lineHeight={'base'}
                textColor={'white.100'}
                w={{ sm: 'full', md: '72' }}
              >
                Give Access
              </Button>
            </Link>
          </Flex> */
}
