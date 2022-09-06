import { Box } from '@chakra-ui/react';
import GooglePermission from '@components/CreateIntegration/GooglePermission';
import { useRouter } from 'next/router';
import { Providers } from '@lib/constants';

const Create = () => {
  const router = useRouter();
  const { appId, provider } = router.query;

  const handleGoBack = (): void => router.back();

  const handleClose = () => router.push('/analytics/explore?apps=1');

  return (
    <>
      {provider === Providers.Google ? (
        <GooglePermission
          navigateBack={handleGoBack}
          handleClose={handleClose}
          appId={appId}
        />
      ) : (
        <Box>Mixpanel</Box>
      )}
    </>
  );
};

export default Create;
