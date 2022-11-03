import SettingIntegrations from '@components/Settings/Integrations';
import { User } from '@lib/domain/user';
import { _getUserInfo } from '@lib/services/userService';
import { getAuthToken } from '@lib/utils/request';
import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const token = getAuthToken(req);
  if (!token || query?.status === 'failed') {
    return {
      props: {},
    };
  }

  const user = await _getUserInfo(token);
  return {
    props: { user },
  };
};

const Integrations = ({ user }: { user: User }) => {
  return <SettingIntegrations user={user} />;
};

export default Integrations;
