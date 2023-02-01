import { Box, Switch } from '@chakra-ui/react';
import { Notifications, NotificationWithUser } from '@lib/domain/notification';
import { SavedItems } from '@lib/domain/watchlist';
import { updateNotificationActiveState } from '@lib/services/notificationService';
import { CellContext } from '@tanstack/react-table';
import React, { useEffect, useState } from 'react';
import omit from 'lodash/omit';

const NotificationActive = ({
  info,
}: {
  info: CellContext<SavedItems, boolean>;
}) => {
  const [isChecked, setIsChecked] = useState(info.getValue());
  const [isToggled, setIsToggled] = useState(false);
  const { details } = info.row.original;

  useEffect(() => {
    if (!isToggled) return;
    const id = details._id;
    const notification = omit(details as NotificationWithUser, ['user']);

    const handleToggleNotification = async () => {
      await updateNotificationActiveState(id, notification, isChecked);
    };
    handleToggleNotification();
    setIsToggled(false);
  }, [isChecked]);

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Switch
        colorScheme={'radioBlack'}
        isChecked={isChecked}
        size={'sm'}
        onChange={(e) => {
          setIsChecked(!isChecked);
          setIsToggled(true);
        }}
      />
    </Box>
  );
};

export default NotificationActive;
