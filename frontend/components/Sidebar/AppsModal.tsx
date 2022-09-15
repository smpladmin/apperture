import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Text,
  Divider,
  RadioGroup,
  Stack,
  Flex,
} from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import Link from 'next/link';
import UserApp from './UserApp';

type AppsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  apps: AppWithIntegrations[];
  selectApp: Function;
  selectedApp: AppWithIntegrations;
  openConfigureAppsModal: () => void;
};

const AppsModal = ({
  isOpen,
  onClose,
  apps,
  selectApp,
  selectedApp,
  openConfigureAppsModal,
}: AppsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} bg={'grey.0'} />
      <ModalContent
        margin={'1rem'}
        rounded={'2xl'}
        maxWidth="168"
        maxHeight={'calc(100% - 100px)'}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          pt={10}
          px={9}
        >
          My Applications
          <ModalCloseButton
            position={'relative'}
            top={0}
            right={0}
            border={'1px'}
            borderColor={'white.200'}
            rounded={'full'}
          />
        </ModalHeader>
        <Divider
          orientation="horizontal"
          marginY={'4'}
          borderColor={'white.200'}
          opacity={1}
        />

        <ModalBody px={9} overflowY={'auto'}>
          <Box pt={4}>
            <RadioGroup
              value={selectedApp._id}
              onChange={(appId) => selectApp(appId)}
            >
              <Stack direction="column">
                {apps.map((app) => {
                  return (
                    <UserApp
                      key={app._id}
                      app={app}
                      isSelected={app._id === selectedApp._id}
                      openConfigureAppsModal={openConfigureAppsModal}
                    />
                  );
                })}
              </Stack>
            </RadioGroup>
          </Box>
        </ModalBody>
        <ModalFooter pt={0} px={9} pb={9} display={'block'}>
          <Flex direction={'column'}>
            <Text
              pt={'6'}
              pb={{ base: '6', md: '9' }}
              fontSize={{ base: 'xs-12', md: 'xs-14' }}
              lineHeight={{ base: 'xs-12', md: 'xs-14' }}
              color={'grey.200'}
              textAlign={'center'}
            >
              Switching applications clears out the current configuration and
              filters.
            </Text>
            <Link href={'/analytics/app/create'}>
              <Button
                width={'full'}
                padding={'4'}
                fontSize={{ base: 'xs-14', md: 'base' }}
                lineHeight={{ base: 'xs-14', md: 'base' }}
                height={'auto'}
                bg={'transparent'}
                border={'1px'}
                borderStyle={'solid'}
                borderColor={'black'}
              >
                + Add Application
              </Button>
            </Link>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AppsModal;
