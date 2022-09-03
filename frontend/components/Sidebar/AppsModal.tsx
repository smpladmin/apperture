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
} from '@chakra-ui/react';
import { App } from '@lib/domain/app';
import Link from 'next/link';
import UserApp from './UserApp';

type AppsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  apps: App[];
  selectApp: Function;
  selectedApp: any;
};

const AppsModal = ({
  isOpen,
  onClose,
  apps,
  selectApp,
  selectedApp,
}: AppsModalProps) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
    >
      <ModalOverlay />
      <ModalContent margin={'1rem'} maxWidth="168">
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

        <ModalBody px={6}>
          <Box pt={4}>
            <RadioGroup
              value={selectedApp._id}
              onChange={(appId) => selectApp(appId)}
            >
              {apps.map((app) => {
                return <UserApp key={app._id} app={app} />;
              })}
            </RadioGroup>
          </Box>
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
        </ModalBody>
        <ModalFooter pt={0} px={6}>
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
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default AppsModal;
