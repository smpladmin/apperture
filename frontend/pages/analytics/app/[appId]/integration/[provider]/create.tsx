import GooglePermission from '@components/CreateIntegration/GooglePermission';
import MixpanelIntegration from '@components/CreateIntegration/MixpanelIntegration';
import { Provider } from '@lib/domain/provider';
import { useRouter } from 'next/router';

const Create = () => {
  const router = useRouter();
  const { appId, provider, add } = router.query;

  const handleGoBack = () => router.back();

  const handleClose = () => router.push('/analytics/explore?apps=1');

  return (
    <>
      {provider === Provider.GOOGLE ? (
        <GooglePermission
          navigateBack={handleGoBack}
          handleClose={handleClose}
          appId={appId}
          add={add}
        />
      ) : (
        <MixpanelIntegration add={add} />
      )}
    </>
  );
};

export default Create;
