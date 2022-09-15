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
  Radio,
  Image,
} from '@chakra-ui/react';
import mixpanelLogo from '@assets/images/mixPanel-icon.png';
import gaLogo from '@assets/images/ga-logo-small.svg';
import { DataSource } from '@lib/domain/datasource';
import { useState } from 'react';
import { Provider } from '@lib/domain/provider';
import { useRouter } from 'next/router';

type SwitchDataSourceProps = {
  isOpen: boolean;
  onClose: () => void;
  dataSources: DataSource[];
};

const DataSourceOption = ({ dataSource }: { dataSource: DataSource }) => {
  const { _id, name, provider, externalSourceId, version } = dataSource;
  return (
    <Flex
      justifyContent={'space-between'}
      borderBottom={'1px'}
      borderStyle={'solid'}
      borderColor={'white.100'}
    >
      <Flex
        w={'full'}
        as={'label'}
        cursor={'pointer'}
        alignItems={'center'}
        justifyContent={'center'}
        gap={'3'}
        px={'3'}
        py={{ base: '3', md: '6' }}
      >
        <Image
          src={provider === Provider.GOOGLE ? gaLogo.src : mixpanelLogo.src}
          h={'8'}
          w={'8'}
        />
        <Flex direction={'column'} gap={0.15}>
          <Text fontSize={'base'} fontWeight={'500'} lineHeight={'base'}>
            {name || Provider.getDisplayName(provider)}
          </Text>
          <Flex dir="row" justifyContent="flex-start">
            <Text
              width={{ base: '30', md: '40' }}
              fontSize={'xs-12'}
              fontWeight={'400'}
              lineHeight={'xs-12'}
              textColor={'grey.200'}
            >
              {externalSourceId}
            </Text>
            {provider === Provider.GOOGLE && (
              <Text
                fontSize={'xs-12'}
                fontWeight={'400'}
                lineHeight={'xs-12'}
                textColor={'grey.200'}
              >
                {version}
              </Text>
            )}
          </Flex>
        </Flex>
        <Radio ml={'auto'} colorScheme={'radioBlack'} value={_id} />
      </Flex>
    </Flex>
  );
};

const SwitchDataSource = ({
  isOpen,
  onClose,
  dataSources,
}: SwitchDataSourceProps) => {
  const [selectedDataSourceId, setSelectedDataSourceId] = useState('');

  const router = useRouter();
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
            {'Zomato Devilery App V3.6.1'}
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
              <Stack direction="column">
                {dataSources.map((ds, i) => {
                  return <DataSourceOption key={ds._id} dataSource={ds} />;
                })}
              </Stack>
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
