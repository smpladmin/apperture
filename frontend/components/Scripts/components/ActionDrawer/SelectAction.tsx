import { Box, Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import { ActionMeta, ActionType } from '@lib/domain/datamartActions';
import TableLogo from '@assets/images/table.svg';
import GoogleSheetLogo from '@assets/images/google-sheets-logo.svg';
import APILogo from '@assets/images/api-logo-new.svg';
import Image from 'next/image';
import { CheckCircle } from 'phosphor-react';
import { getTableName } from '@components/Scripts/util';

type SelectActionProps = {
  selectedAction: ActionType | undefined;
  setSelectedAction: React.Dispatch<
    React.SetStateAction<ActionType | undefined>
  >;
  setActiveStep: React.Dispatch<React.SetStateAction<number>>;
  setMeta: React.Dispatch<React.SetStateAction<ActionMeta | {}>>;
  workbookName: string;
};

const SelectAction = ({
  selectedAction,
  setSelectedAction,
  setActiveStep,
  setMeta,
  workbookName,
}: SelectActionProps) => {
  const Actions = [
    { type: ActionType.TABLE, name: 'Table' },
    { type: ActionType.GOOGLE_SHEET, name: 'Sheets' },
    { type: ActionType.API, name: 'API' },
  ];

  const getLogo = (actionType: ActionType) => {
    const logos = {
      [ActionType.GOOGLE_SHEET]: GoogleSheetLogo,
      [ActionType.TABLE]: TableLogo,
      [ActionType.API]: APILogo,
    };
    return logos[actionType];
  };
  return (
    <Flex direction={'column'} gap={'2'} mt={'4'}>
      <Text
        fontSize={'xs-12'}
        lineHeight={'xs-12'}
        fontWeight={'500'}
        color={'grey.800'}
      >
        Select an action
      </Text>
      <Flex>
        <RadioGroup
          value={selectedAction}
          onChange={(value: ActionType) => {
            setActiveStep(1);
            setMeta(
              value === ActionType.TABLE
                ? { name: getTableName(workbookName) }
                : {}
            );
            setSelectedAction(value);
          }}
        >
          <Flex gap={'12'}>
            {Actions.map((action) => {
              return (
                <Flex
                  direction={'column'}
                  gap={'2'}
                  key={action.type}
                  cursor={'pointer'}
                  as={'label'}
                >
                  <Box position={'relative'}>
                    <Flex
                      alignItems={'center'}
                      justifyContent={'center'}
                      minWidth={'12'}
                      minHeight={'12'}
                      borderWidth={'1px'}
                      borderRadius={'8'}
                      zIndex={'0'}
                      borderColor={
                        action.type === selectedAction ? 'grey.900' : 'grey.700'
                      }
                    >
                      <Image src={getLogo(action.type)} />
                    </Flex>
                    {action.type === selectedAction && (
                      <Box
                        position={'absolute'}
                        top={'0'}
                        right={'0'}
                        transform={'translate(30%, -30%)'}
                        zIndex={'1'}
                      >
                        <CheckCircle weight="fill" size={14} />
                      </Box>
                    )}
                  </Box>
                  <Text
                    fontSize={'xs-12'}
                    lineHeight={'xs-12'}
                    fontWeight={'500'}
                    color={'black.500'}
                    textAlign={'center'}
                  >
                    {action.name}
                  </Text>
                  <Radio hidden value={action.type} />
                </Flex>
              );
            })}
          </Flex>
        </RadioGroup>
      </Flex>
    </Flex>
  );
};

export default SelectAction;
