import { Flex, Text } from '@chakra-ui/react';
import { DataMartWithUser } from '@lib/domain/datamart';
import { SavedItems } from '@lib/domain/watchlist';
import { CellContext } from '@tanstack/react-table';
import Image from 'next/image';
import GoogleSheetLogo from '@assets/images/google-sheets-logo.svg';
import APILogo from '@assets/images/api-logo-new.svg';
import TableLogo from '@assets/images/table.svg';
import { ActionType } from '@lib/domain/datamartActions';

export const DatamartActionsType = ({
  info,
}: {
  info: CellContext<SavedItems, DataMartWithUser>;
}) => {
  const { details } = info?.row?.original;

  const uniqueActionTypes = [
    ...new Set(
      (details as DataMartWithUser)?.actions?.map((action) => action.type)
    ),
  ];

  const getActionTypeIcon = (type: ActionType) => {
    const icons: { [key: string]: any } = {
      [ActionType.GOOGLE_SHEET]: GoogleSheetLogo,
      [ActionType.TABLE]: TableLogo,
      [ActionType.API]: APILogo,
    };
    return icons[type];
  };

  return (
    <Flex gap={'3'}>
      {uniqueActionTypes.map((type) => {
        return (
          <Image
            key={type}
            src={getActionTypeIcon(type)}
            width={'24'}
            height={'24'}
            style={{
              minWidth: '24px',
              minHeight: '24px',
            }}
            alt={'action'}
          />
        );
      })}
    </Flex>
  );
};

export default DatamartActionsType;
