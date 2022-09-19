import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Text,
  Flex,
  Divider,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';
import { DataSource } from '@lib/domain/datasource';
import { Fragment, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import DataSourceComponent from '../DataSource';
import { AppWithIntegrations } from '@lib/domain/app';

type SwitchDataSourceProps = {
  isOpen: boolean;
  onClose: () => void;
  dataSources: DataSource[];
  selectedApp: AppWithIntegrations;
};

const SwitchDataSource = ({
  isOpen,
  onClose,
  dataSources,
  selectedApp,
}: SwitchDataSourceProps) => {
  const router = useRouter();
  const { dsId } = router.query;

  const [selectedDataSourceId, setSelectedDataSourceId] = useState(
    dsId as string
  );

  useEffect(() => {
    setSelectedDataSourceId(dsId as string);
  }, [selectedApp, dsId]);

  const updateDataSourceId = () => {
    onClose();
    router.push({
      pathname: '/analytics/explore/[dsId]',
      query: { dsId: selectedDataSourceId },
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      isCentered
      blockScrollOnMount={false}
      size={'2xl'}
      trapFocus={false}
    >
      <ModalOverlay backdropFilter={'blur(20px)'} />
      <ModalContent
        margin={'1rem'}
        maxWidth="168"
        maxHeight={'calc(100% - 100px)'}
        borderRadius={{ base: '16px', md: '20px' }}
      >
        <ModalHeader
          display={'flex'}
          justifyContent={'space-between'}
          alignItems={'center'}
          fontSize={{ base: 'sh-20', md: 'sh-24' }}
          lineHeight={{ base: 'sh-20', md: 'sh-24' }}
          pt={{ base: '4', md: '10' }}
          pb={{ base: '6', md: '0' }}
          px={{ base: '4', md: '9' }}
        >
          Data Source
          <ModalCloseButton
            position={'relative'}
            top={0}
            right={0}
            border={'1px'}
            borderColor={'white.200'}
            rounded={'full'}
            fontSize={'0.55rem'}
          />
        </ModalHeader>

        <Divider
          orientation="horizontal"
          mt={'7'}
          mb={'0'}
          borderColor={'white.200'}
          opacity={1}
          display={{ base: 'none', md: 'block' }}
        />
        <Box
          pt={{ base: '0', md: '9' }}
          pl={{ base: '4', md: '9' }}
          pr={{ base: '4', md: '9' }}
          pb={{ base: '6', md: '9' }}
        >
          <Text
            color={'grey.100'}
            fontWeight={'500'}
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
          >
            {selectedApp?.name}
          </Text>
        </Box>
        <ModalBody
          px={{ base: '4', md: '9' }}
          overflowY={'auto'}
          pt={'0'}
          pb={'0'}
        >
          <Box pt={0}>
            <RadioGroup
              value={selectedDataSourceId}
              onChange={setSelectedDataSourceId}
            >
              <Flex direction="column">
                {dataSources.map((ds) => {
                  return (
                    <Fragment key={ds._id}>
                      <DataSourceComponent
                        dataSource={ds}
                        hasRadio={true}
                        isSelected={ds._id === selectedDataSourceId}
                      />
                      <Divider
                        orientation="horizontal"
                        borderColor={'white.200'}
                        opacity={1}
                      />
                    </Fragment>
                  );
                })}
              </Flex>
            </RadioGroup>
          </Box>
        </ModalBody>
        <ModalFooter
          pt={{ base: '0', md: '0' }}
          px={{ base: '4', md: '9' }}
          pb={{ base: '4', md: '9' }}
          display={'block'}
        >
          <Flex direction={'column'}>
            <Text
              pt={'6'}
              pb={{ base: '6', md: '9' }}
              fontSize={{ base: 'xs-12', md: 'xs-14' }}
              lineHeight={{ base: 'xs-12', md: 'xs-14' }}
              color={'grey.200'}
              textAlign={'center'}
            >
              Switching the data source reloads the map and clears out your
              previous selection.
            </Text>
            <Button
              variant={'primary'}
              width={'full'}
              padding={'4'}
              color={'white'}
              fontSize={{ base: 'xs-14', md: 'base' }}
              lineHeight={{ base: 'xs-14', md: 'base' }}
              height={'auto'}
              bg={'black'}
              onClick={updateDataSourceId}
            >
              Update
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SwitchDataSource;
