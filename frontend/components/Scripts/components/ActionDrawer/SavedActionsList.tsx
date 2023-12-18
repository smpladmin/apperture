import {
  Box,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Text,
  useDisclosure,
} from '@chakra-ui/react';
import { TypeNameMap, describeSchedule } from '@components/Scripts/util';
import {
  APIMeta,
  ActionType,
  DatamartAction,
  GoogleSheetMeta,
  TableMeta,
} from '@lib/domain/datamartActions';
import { GREY_600, GREY_700 } from '@theme/index';
import Image from 'next/image';
import { Clock, DotsThreeVertical, Pencil, Trash } from 'phosphor-react';
import React from 'react';
import GoogleSheetLogo from '@assets/images/google-sheets-logo.svg';
import APILogo from '@assets/images/api-logo-new.svg';
import TableLogo from '@assets/images/table.svg';
import ConfirmationModal from '@components/ConfirmationModal';
import { deleteDatamartAction } from '@lib/services/datamartActionService';

const SavedActionsList = ({
  datamartActions,
  setDatartActions,
  setIsActionBeingCreated,
  setAction,
}: {
  datamartActions: DatamartAction[];
  setDatartActions: React.Dispatch<React.SetStateAction<DatamartAction[]>>;
  setIsActionBeingCreated: React.Dispatch<React.SetStateAction<boolean>>;
  setAction: React.Dispatch<React.SetStateAction<DatamartAction | undefined>>;
}) => {
  const groupedActions = datamartActions.reduce(
    (acc: Record<string, Array<DatamartAction>>, action) => {
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

  const handleDelete = async (action: DatamartAction) => {
    await deleteDatamartAction(action._id);
    const updatedDatamartActions = datamartActions.filter(
      (datamartAction) => datamartAction._id !== action._id
    );
    setDatartActions(updatedDatamartActions);
  };

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
                      <Menu>
                        <MenuButton
                          _active={{
                            bg: 'white.200',
                          }}
                          _hover={{ bg: 'white.200' }}
                          p={'1'}
                          bg={'transparent'}
                          borderRadius={'4'}
                        >
                          <DotsThreeVertical
                            weight="bold"
                            size={16}
                            color={GREY_600}
                          />
                        </MenuButton>
                        <MenuList
                          minWidth={'30'}
                          p={'1'}
                          borderRadius={'4'}
                          zIndex={'3'}
                        >
                          <MenuItem
                            onClick={() => {
                              setAction(action);
                              setIsActionBeingCreated(true);
                            }}
                            _focus={{
                              backgroundColor: 'white.400',
                            }}
                            fontSize={'xs-12'}
                            lineHeight={'xs-12'}
                            fontWeight={'400'}
                            color={'grey.900'}
                            px={'2'}
                            py={'3'}
                            borderRadius={'4'}
                          >
                            <Flex gap={'1'} alignItems={'center'}>
                              <Pencil size={12} color={GREY_700} />
                              Edit
                            </Flex>
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              handleDelete(action);
                            }}
                            _focus={{
                              backgroundColor: 'white.400',
                            }}
                            fontSize={'xs-12'}
                            lineHeight={'xs-12'}
                            fontWeight={'400'}
                            color={'grey.900'}
                            px={'2'}
                            py={'3'}
                            borderRadius={'4'}
                          >
                            <Flex gap={'1'} alignItems={'center'}>
                              <Trash size={12} color={GREY_700} />
                              Delete
                            </Flex>
                          </MenuItem>
                        </MenuList>
                      </Menu>
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
