import {
  Avatar,
  Button,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from '@chakra-ui/react';
import { AppertureUser } from '@lib/domain/user';
import { get_user_domain, update_app } from '@lib/services/appService';
import {
  getAppertureUserInfo,
  get_apperture_users,
} from '@lib/services/userService';
import { BLACK, WHITE_DEFAULT } from '@theme/index';
import { useEffect, useState } from 'react';
import GeneralAccessDropdown from './GeneralAccessDropdown';
import MultiSelectDropdown from './MultiSelectDropdown';

type ShareAppModalProps = {
  isOpen: boolean;
  onClose: () => void;
  appId: string;
};

const ShareAppModal = ({ isOpen, onClose, appId }: ShareAppModalProps) => {
  const [existingUsers, setExistingUsers] = useState<AppertureUser[]>([]);
  const [selectedValues, setSelectedValues] = useState<string[]>([]);
  const [appUsers, setAppUsers] = useState<AppertureUser[]>([]);
  const initalDropdownOptions = ['Restricted'];
  const [dropdownOptions, setDropdownOptions] = useState<string[]>(
    initalDropdownOptions
  );
  const [selectedOption, setSelectedOption] = useState<string>('Restricted');
  const [currentUserEmail, setCurrentUserEmail] = useState('');

  const handleDropdownChange = (newValue: string) => {
    setSelectedOption(newValue);
  };

  useEffect(() => {
    if (isOpen) {
      setDropdownOptions(initalDropdownOptions);
      const setUsers = async () => {
        const allAppertureUsers = await get_apperture_users(null);
        setExistingUsers(allAppertureUsers);
      };
      const setUsersForApp = async () => {
        const users = await get_apperture_users(appId);
        setAppUsers(users);
      };
      const getDomain = async () => {
        const res = await get_user_domain(appId);
        if (res?.domain) {
          setDropdownOptions((prevValues) => [...prevValues, res.domain]);
        }
        if (res?.orgAccess) {
          setSelectedOption(res.domain);
        }
      };
      const getCurrentUser = async () => {
        const currentUser = await getAppertureUserInfo();
        setCurrentUserEmail(currentUser.email);
      };
      setUsers();
      setUsersForApp();
      getDomain();
      getCurrentUser();
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    setSelectedValues([]);
    onClose();
  };

  const handleShareApp = async () => {
    const response = await update_app(
      appId,
      selectedValues.length ? selectedValues : null,
      !(selectedOption === 'Restricted')
    );
    handleCloseModal();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseModal}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} bg={'grey.0'} />
      <ModalContent
        margin={'1rem'}
        maxWidth="168"
        maxHeight={'calc(100% - 100px)'}
        borderRadius={{ base: '16px', md: '20px' }}
        px={'28px'}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          fontSize={{ base: 'sh-20', md: 'sh-24' }}
          lineHeight={{ base: 'sh-20', md: 'sh-24' }}
          pt={'32px'}
          pb={'8px'}
        >
          Share this workspace
        </ModalHeader>
        <ModalBody overflowY={'auto'} pb={'0'}>
          <Flex direction={'column'} gap={6}>
            <Text>Invite members to collaborate</Text>
            <MultiSelectDropdown
              existingUsers={existingUsers}
              selectedValues={selectedValues}
              setSelectedValues={setSelectedValues}
            />
            <Text fontSize={'xs-16'} fontWeight={500}>
              People with access
            </Text>
            <Stack direction={'column'} gap={2}>
              {appUsers.map((user, index) => {
                return (
                  <Flex gap={3} alignItems={'center'} key={index}>
                    <Avatar
                      name={user.firstName}
                      fontWeight={'bold'}
                      size="sm"
                      textColor={'white'}
                      h={{ base: '8', md: '12' }}
                      w={{ base: '8', md: '12' }}
                      fontSize={{ base: 'xs', md: 'xs-14' }}
                      lineHeight={{ base: 'xs', md: 'xs-14' }}
                    />
                    <Flex direction={'column'}>
                      <Text
                        fontSize={'xs-14'}
                        fontWeight={500}
                        lineHeight={'lh-130'}
                      >
                        {`${user.firstName} ${user.lastName} ${
                          currentUserEmail == user.email ? '(you)' : ''
                        }`}
                      </Text>
                      <Text
                        fontSize={'xs-12'}
                        fontWeight={400}
                        lineHeight={'lh-135'}
                        color={'grey.800'}
                      >
                        {user.email}
                      </Text>
                    </Flex>
                  </Flex>
                );
              })}
            </Stack>

            <Text fontSize={'xs-16'} fontWeight={500} lineHeight={'lh-120'}>
              General Access
            </Text>
            <GeneralAccessDropdown
              options={dropdownOptions}
              value={selectedOption}
              onChange={handleDropdownChange}
            />
          </Flex>
        </ModalBody>
        <ModalFooter pt={6} pb={8} display={'block'}>
          <Flex justifyContent={'flex-end'} gap={2}>
            <Button
              w={'90px'}
              h={'42px'}
              px={4}
              py={'6px'}
              borderRadius={'8px'}
              borderColor={BLACK}
              border={'1px'}
              background={'inherit'}
              _hover={{ bg: 'inherit' }}
              fontSize={'xs-14'}
              fontWeight={500}
              lineHeight={'lh-130'}
              onClick={handleCloseModal}
            >
              Cancel
            </Button>
            <Button
              w={'90px'}
              h={'42px'}
              px={4}
              py={'6px'}
              borderRadius={'8px'}
              borderColor={BLACK}
              border={'1px'}
              color={WHITE_DEFAULT}
              background={BLACK}
              _hover={{ bg: BLACK }}
              fontSize={'xs-14'}
              fontWeight={500}
              lineHeight={'lh-130'}
              onClick={handleShareApp}
            >
              Done
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default ShareAppModal;
