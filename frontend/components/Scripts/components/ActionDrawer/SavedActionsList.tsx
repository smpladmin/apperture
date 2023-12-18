import { Box, Flex, Text } from '@chakra-ui/react';
import { TypeNameMap, describeSchedule } from '@components/Scripts/util';
import {
  APIMeta,
  ActionType,
  DatamartActions,
  GoogleSheetMeta,
  TableMeta,
} from '@lib/domain/datamartActions';
import { GREY_600 } from '@theme/index';
import Image from 'next/image';
import { Clock, DotsThreeVertical } from 'phosphor-react';
import React from 'react';
import GoogleSheetLogo from '@assets/images/google-sheets-logo.svg';
import APILogo from '@assets/images/api-logo-new.svg';
import TableLogo from '@assets/images/table.svg';

const SavedActionsList = ({
  datamartActions,
}: {
  datamartActions: DatamartActions[];
}) => {
  const groupedActions = datamartActions.reduce(
    (acc: Record<string, Array<DatamartActions>>, action) => {
      const { type } = action;
      if (!acc[type]) {
        acc[type] = [];
      }
      acc[type].push(action);
      return acc;
    },
    {}
  );

  const getLogo = (actionType: ActionType) => {
    const logos = {
      [ActionType.GOOGLE_SHEET]: GoogleSheetLogo,
      [ActionType.TABLE]: TableLogo,
      [ActionType.API]: APILogo,
    };
    return logos[actionType];
  };

  console.log({ datamartActions });

  return (
    <Box h={'full'} w={'full'} overflow={'auto'}>
      <Text
        fontSize={'xs-14'}
        fontWeight={'500'}
        lineHeight={'xs-14'}
        color={'grey.800'}
      >
        CURRENT ACTIONS
      </Text>
      <Flex direction={'column'} gap={'10'} mt={'4'}>
        {Object.keys(groupedActions).map((type) => {
          return (
            <Box key={type}>
              <Flex
                bg={'white.500'}
                borderRadius={'10'}
                gap={'1'}
                alignItems={'center'}
                padding={'3'}
              >
                <Image
                  src={getLogo(type as ActionType)}
                  width={'28'}
                  height={'28'}
                />
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'500'}
                >
                  {TypeNameMap[type as ActionType]}
                </Text>
              </Flex>
              <Flex direction={'column'} gap={'6px'}>
                {groupedActions[type].map((action, index) => {
                  return (
                    <Flex
                      key={index}
                      justifyContent={'space-between'}
                      py={'3'}
                      px={'7'}
                      borderBottom={'0.4px solid #DFDFDF'}
                    >
                      <Text
                        fontSize={'xs-12'}
                        lineHeight={'xs-12'}
                        fontWeight={'500'}
                        color={'grey.800'}
                        width={'70'}
                      >
                        {type === ActionType.GOOGLE_SHEET
                          ? (action?.meta as GoogleSheetMeta)?.spreadsheet?.name
                          : type === ActionType.API
                          ? (action?.meta as APIMeta)?.url
                          : (action?.meta as TableMeta)?.name}
                      </Text>

                      <Flex gap={'2'} alignItems={'center'} w={'50'}>
                        <Clock size={16} color={GREY_600} />
                        <Text
                          fontSize={'xs-12'}
                          lineHeight={'xs-12'}
                          fontWeight={'500'}
                          color={'grey.800'}
                        >
                          {describeSchedule(action?.schedule)}
                        </Text>
                      </Flex>
                      <DotsThreeVertical
                        weight="bold"
                        size={16}
                        color={GREY_600}
                      />
                    </Flex>
                  );
                })}
              </Flex>
            </Box>
          );
        })}
      </Flex>
    </Box>
  );
};

export default SavedActionsList;
