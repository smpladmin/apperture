import AmplitudeIntegration from '@components/CreateIntegration/AmplitudeIntegration';
import GooglePermission from '@components/CreateIntegration/GooglePermission';
import MixpanelIntegration from '@components/CreateIntegration/MixpanelIntegration';
import { Provider } from '@lib/domain/provider';
import { useRouter } from 'next/router';

const Create = () => {
  const router = useRouter();
  const { appId, provider, add, previousDsId } = router.query;
  const handleGoBack = () => router.back();

  const handleClose = () =>
    router.push({
      pathname: `/analytics/explore/[dsId]`,
      query: { dsId: previousDsId, apps: 1 },
    });

  return (
    <>
      {provider === Provider.GOOGLE ? (
        <GooglePermission
          navigateBack={handleGoBack}
          handleClose={handleClose}
          query={{ ...router.query }}
        />
      ) : provider === Provider.MIXPANEL?(
        <MixpanelIntegration add={add} handleClose={handleClose} />
      ):<AmplitudeIntegration add={add} handleClose={handleClose} />}
    </>
  );
};

export default Create;
