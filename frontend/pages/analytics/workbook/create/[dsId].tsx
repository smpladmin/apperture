import React from 'react';
import Workbook from '@components/Workbook';
import { GetServerSideProps } from 'next';
import { getAuthToken } from '@lib/utils/request';
import { _getAppertureUserInfo } from '@lib/services/userService';
import { AppertureUser } from '@lib/domain/user';

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  const token = getAuthToken(req);
  if (!token) {
    return {
      props: {},
    };
  }

  const user = await _getAppertureUserInfo(token);
  return {
    props: { user },
  };
};

const Sheet = ({ user }: { user: AppertureUser }) => {
  return <Workbook user={user} />;
};

export default Sheet;
