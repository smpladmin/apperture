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
      <ModalContent
        margin={'1rem'}
        maxWidth="168"
        maxHeight={{ base: 'calc(100% - 100px)', md: 'calc(100% - 200px)' }}
        borderRadius={{ base: '16px', md: '20px' }}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          fontSize={{ base: 'sh-20', md: 'sh-24' }}
          lineHeight={{ base: 'sh-20', md: 'sh-24' }}
          pt={{ base: '5', md: '20px' }}
          pb={{ base: '7', md: '20px' }}
          px={{ base: '5', md: '20px' }}
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
          mt={'7'}
          mb={'9'}
          borderColor={'white.200'}
          opacity={1}
          display={{ base: 'none', md: 'block' }}
        />

        <ModalBody px={{ base: '5', md: '9' }} overflowY={'auto'} pt={'0'}>
          <Box pt={0}>
            <RadioGroup
              value={selectedApp._id}
              onChange={(appId) => selectApp(appId)}
            >
              <Stack direction="column">
                {apps.map((app) => {
                  return <UserApp key={app._id} app={app} />;
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
