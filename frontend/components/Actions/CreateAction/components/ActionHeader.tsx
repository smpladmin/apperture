import { Button, Flex, IconButton, Input, Text } from '@chakra-ui/react';
import { deleteAction } from '@lib/services/actionService';
import { useRouter } from 'next/router';
import { useState } from 'react';
import DeleteAction from './DeleteAction';

type ActionHeaderProps = {
  actionName: string;
  setActionName: Function;
  isSaveDisabled: boolean;
  saveOrUpdateAction: Function;
  isDisabled: Boolean;
};

const ActionHeader = ({
  actionName,
  setActionName,
  isSaveDisabled,
  saveOrUpdateAction,
  isDisabled,
}: ActionHeaderProps) => {
  const [showNameInput, setShowNameInput] = useState(false);

  const router = useRouter();
  const { dsId } = router.query;
  const { actionId } = router.query;

  const handleDelete = () => {
    deleteAction((actionId as string) || '');
    router.push({
      pathname: '/analytics/action/list/[dsId]',
      query: { dsId },
    });
  };

  return (
    <Flex
      py={'4'}
      pl={'4'}
      pr={'6'}
      justifyContent={'space-between'}
      borderBottom={'1px'}
      borderColor={'white.200'}
    >
      <Flex alignItems={'baseline'} gap={'3'}>
        <Flex
          cursor={'pointer'}
          onClick={() => {
            router.push(`/analytics/action/list/${dsId}`);
          }}
        >
          <i className="ri-arrow-left-line"></i>
        </Flex>
        <Flex direction={'column'} gap={'1'}>
          {showNameInput ? (
            <Input
              type={'text'}
              autoFocus
              variant="flushed"
              focusBorderColor={'black.100'}
              value={actionName}
              onChange={(e) => setActionName(e.target.value)}
              onBlur={() => setShowNameInput(false)}
              data-testid={'action-name-input'}
              onKeyDown={(e) =>
                e.key === 'Enter' ? setShowNameInput(false) : () => {}
              }
            />
          ) : (
            <Flex alignItems={'center'}>
              <Text
                fontSize={'sh-20'}
                lineHeight={'sh-20'}
                fontWeight={'600'}
                data-testid={'action-name'}
              >
                {actionName}
              </Text>
              {!isDisabled && (
                <IconButton
                  aria-label="Edit"
                  icon={<i className="ri-pencil-fill" />}
                  h={'5'}
                  w={'5'}
                  color={'white.200'}
                  bg={'transparent'}
                  _hover={{
                    backgroundColor: 'white.0',
                    color: 'grey.100',
                  }}
                  _active={{
                    backgroundColor: 'transparent',
                  }}
                  onClick={() => setShowNameInput(true)}
                  data-testid={'action-name-edit-button'}
                />
              )}
            </Flex>
          )}
          <Text
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            color={'grey.100'}
          >
            Action
          </Text>
        </Flex>
      </Flex>
      {actionId ? (
        <DeleteAction handleDelete={handleDelete} />
      ) : (
        <Button
          px={'4'}
          py={'2'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'500'}
          bg={'black.100'}
          color={'white.DEFAULT'}
          _hover={{
            bg: 'grey.200',
          }}
          disabled={isSaveDisabled}
          onClick={() => saveOrUpdateAction()}
          data-testid={'save-button'}
        >
          Save
        </Button>
      )}
    </Flex>
  );
};

export default ActionHeader;
