import AmplitudeIntegration from '@components/CreateIntegration/AmplitudeIntegration';
import ClevertapIntegration from '@components/CreateIntegration/ClevertapIntegration';
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
      pathname: `/analytics/home/[dsId]`,
      query: { dsId: previousDsId, apps: 1 },
    });
  switch (provider) {
    case Provider.GOOGLE:
      return (
        <GooglePermission
          navigateBack={handleGoBack}
          handleClose={handleClose}
          query={{ ...router.query }}
        />
      );
    case Provider.MIXPANEL:
      return <MixpanelIntegration add={add} handleClose={handleClose} />;
    case Provider.AMPLITUDE:
      return <AmplitudeIntegration add={add} handleClose={handleClose} />;
    case Provider.CLEVERTAP:
      return <ClevertapIntegration add={add} handleClose={handleClose} />;
    default:
      return <></>;
  }
};

export default Create;
