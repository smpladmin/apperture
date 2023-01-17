import Layout from '@components/Layout';
import SettingIntegrations from '@components/Settings/Integrations';
import { AppertureUser } from '@lib/domain/user';
import { _getAppertureUserInfo } from '@lib/services/userService';
import { getAuthToken } from '@lib/utils/request';
import { _getAppsWithIntegrations } from '@lib/services/appService';
import { GetServerSideProps } from 'next';
import { ReactElement } from 'react';
import { AppWithIntegrations } from '@lib/domain/app';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getAuthToken(req);
  if (!token) {
    return {
      props: {},
    };
  }
  const apps = await _getAppsWithIntegrations(token);
  const user = await _getAppertureUserInfo(token);
  return {
    props: { user, apps },
  };
};

const Integrations = ({ user }: { user: AppertureUser }) => {
  return <SettingIntegrations user={user} />;
};

Integrations.getLayout = function getLayout(
  page: ReactElement,
  apps: AppWithIntegrations[]
) {
  return (
    <Layout apps={apps} hideHeader={true}>
      {page}
    </Layout>
  );
};

export default Integrations;
