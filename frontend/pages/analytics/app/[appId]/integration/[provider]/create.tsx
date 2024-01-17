import AmplitudeIntegration from '@components/CreateIntegration/AmplitudeIntegration';
import ClevertapIntegration from '@components/CreateIntegration/ClevertapIntegration';
import GooglePermission from '@components/CreateIntegration/GooglePermission';
import MixpanelIntegration from '@components/CreateIntegration/MixpanelIntegration';
import APIIntegration from '@components/CreateIntegration/APIIntegration';
import CSVIntegration from '@components/CreateIntegration/CSVIntegration';
import { Provider } from '@lib/domain/provider';
import { useRouter } from 'next/router';
import DatabaseIntegration from '@components/CreateIntegration/DatabaseIntegration';
import mysqlLogo from '@assets/images/mysql-icon.png';
import mssqlLogo from '@assets/images/mssql-icon.png';
import BranchIntegration from '@components/CreateIntegration/BranchIntegration';
import TataIVRIntegration from '@components/CreateIntegration/TataIVRIntegration';
import EventLogsIntegration from '@components/CreateIntegration/EventLogsIntegration';

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
          add={add}
          query={{ ...router.query }}
        />
      );
    case Provider.MIXPANEL:
      return <MixpanelIntegration add={add} handleClose={handleClose} />;
    case Provider.AMPLITUDE:
      return <AmplitudeIntegration add={add} handleClose={handleClose} />;
    case Provider.CLEVERTAP:
      return <ClevertapIntegration add={add} handleClose={handleClose} />;
    case Provider.BRANCH:
      return <BranchIntegration add={add} handleClose={handleClose} />;
    case Provider.API:
      return <APIIntegration add={add} handleClose={handleClose} />;
    case Provider.TATA_IVR:
      return <TataIVRIntegration add={add} handleClose={handleClose} />;
    case Provider.MYSQL:
      return (
        <DatabaseIntegration
          add={add}
          handleClose={handleClose}
          logo={mysqlLogo}
        />
      );
    case Provider.MSSQL:
      return (
        <DatabaseIntegration
          add={add}
          handleClose={handleClose}
          logo={mssqlLogo}
        />
      );
    case Provider.CSV:
      return <CSVIntegration add={add} handleClose={handleClose} />;
    case Provider.EVENT_LOGS:
      return <EventLogsIntegration add={add} handleClose={handleClose} />;
    default:
      return <></>;
  }
};

export default Create;
