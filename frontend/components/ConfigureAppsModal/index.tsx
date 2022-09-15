import {
  Avatar,
  Divider,
  Flex,
  IconButton,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from '@chakra-ui/react';
import { AppWithIntegrations } from '@lib/domain/app';
import DataSourceComponent from './DataSource';
import { DataSource } from '@lib/domain/datasource';
import { Fragment } from 'react';
import Link from 'next/link';

type ConfigureAppsModalProps = {
  isConfigureAppsModalOpen: boolean;
  closeConfigureAppsModal: () => void;
  app: AppWithIntegrations;
};

const ConfigureAppsModal = ({
  isConfigureAppsModalOpen,
  closeConfigureAppsModal,
  app,
}: ConfigureAppsModalProps) => {
  const handleCloseAndNavigateBack = () => {
    closeConfigureAppsModal();
  };

  const dataSources = app?.integrations.flatMap(
    (integration) => integration.datasources as DataSource[]
  );

  return (
    <Modal
      isOpen={isConfigureAppsModalOpen}
      onClose={closeConfigureAppsModal}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} bg={'grey.0'} />
      <ModalContent
        h={{ base: 'full', md: 'auto' }}
        rounded={{ base: 0, md: '2xl' }}
        maxWidth={{ base: 'full', md: '168' }}
        maxHeight={{ base: 'full', md: 'calc(100% - 100px)' }}
        pt={{ base: 0, md: '9' }}
        marginY={0}
      >
        <ModalHeader
          display={'flex'}
          w={'full'}
          flexDirection={'column'}
          gap={'3'}
          px={6}
          pb={0}
        >
          <Flex justifyContent={'space-between'}>
            <IconButton
              aria-label="close"
              variant={'secondary'}
              icon={<i className="ri-arrow-left-line"></i>}
              rounded={'full'}
              bg={'white.DEFAULT'}
              border={'1px'}
              borderColor={'white.200'}
              onClick={handleCloseAndNavigateBack}
            />
            <Avatar
              name={app.name}
              fontWeight={'bold'}
              size="sm"
              textColor={'white'}
              h={'14'}
              w={'14'}
              fontSize={{ base: 'xs', md: 'xs-14' }}
              lineHeight={{ base: 'xs', md: 'xs-14' }}
            />
            <IconButton
              aria-label="close"
              variant={'secondary'}
              icon={<i className="ri-more-2-line"></i>}
              rounded={'full'}
              bg={'white.DEFAULT'}
              border={'1px'}
              borderColor={'white.200'}
            />
          </Flex>
          <Flex justifyContent={'space-between'} py={'2'}>
            <Text fontWeight={'medium'} fontSize={'sh-24'} lineHeight={'sh-24'}>
              {app.name}
            </Text>
            <IconButton
              aria-label="close"
              icon={<i className="ri-edit-2-line"></i>}
              color={'grey.DEFAULT'}
              bg={'white.DEFAULT'}
              _hover={{
                bg: 'white.DEFAULT',
              }}
            />
          </Flex>
        </ModalHeader>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalBody py={6} px={0} overflowY={'auto'}>
          <Flex justifyContent={'space-between'} px={6}>
            <Text
              fontWeight={'normal'}
              fontSize={'xs-14'}
              lineHeight={'base'}
              color={'grey.200'}
            >
              {`Data Sources (${dataSources.length})`}
            </Text>
            <Link
              href={`/analytics/app/${encodeURIComponent(
                app._id
              )}/integration/select?add=true`}
            >
              <Text
                fontWeight={'normal'}
                fontSize={'xs-14'}
                lineHeight={'sh-24'}
                cursor={'pointer'}
              >
                {'+Add'}
              </Text>
            </Link>
          </Flex>
          {dataSources.map((dataSource, i, dataSources) => {
            return (
              <Fragment key={dataSource._id}>
                <DataSourceComponent dataSource={dataSource} />
                {i !== dataSources.length - 1 && (
                  <Divider
                    orientation="horizontal"
                    borderColor={'white.200'}
                    opacity={1}
                  />
                )}
              </Fragment>
            );
          })}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ConfigureAppsModal;
