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
import DataSourceComponent from '../DataSource';
import { DataSource } from '@lib/domain/datasource';
import { Fragment, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

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

  const router = useRouter();
  const { dsId } = router.query;

  const [dataSources, setDataSources] = useState(
    app?.integrations.flatMap(
      (integration) => integration.datasources as DataSource[]
    )
  );

  useEffect(() => {
    setDataSources(
      app?.integrations.flatMap(
        (integration) => integration.datasources as DataSource[]
      )
    );
  }, [app, dsId]);

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
        bg={'white.DEFAULT'}
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
          px={{ base: '4', md: '9' }}
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
              aria-label="more"
              variant={'secondary'}
              icon={<i className="ri-more-2-line"></i>}
              rounded={'full'}
              bg={'white.DEFAULT'}
              border={'1px'}
              borderColor={'white.200'}
              isDisabled={true}
            />
          </Flex>
          <Flex justifyContent={'space-between'} py={'2'}>
            <Text fontWeight={'medium'} fontSize={'sh-24'} lineHeight={'sh-24'}>
              {app.name}
            </Text>
            <IconButton
              aria-label="edit app name"
              icon={<i className="ri-edit-2-line"></i>}
              color={'grey.DEFAULT'}
              bg={'white.DEFAULT'}
              _hover={{
                bg: 'white.DEFAULT',
              }}
              cursor={'default'}
              opacity={0}
            />
          </Flex>
        </ModalHeader>
        <Divider
          orientation="horizontal"
          borderColor={'white.200'}
          opacity={1}
        />
        <ModalBody py={6} px={{ base: '4', md: '9' }} overflowY={'auto'}>
          <Flex justifyContent={'space-between'}>
            <Text
              fontWeight={'normal'}
              fontSize={'xs-14'}
              lineHeight={'base'}
              color={'grey.200'}
            >
              {`Data Sources (${dataSources.length})`}
            </Text>
            <Link
              href={`/analytics/app/${app._id}/integration/select?add=true&previousDsId=${dsId}`}
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
