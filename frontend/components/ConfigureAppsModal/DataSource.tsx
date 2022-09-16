import { Box, Flex, Text } from '@chakra-ui/react';
import gaLogo from '@assets/images/ga-logo-small.svg';
import mixpanelLogo from '@assets/images/mixPanel-icon.png';
import Image from 'next/image';
import { DataSource } from '@lib/domain/datasource';
import { Provider } from '@lib/domain/provider';

const ProviderProperty = ({ propertyName }: { propertyName: string }) => {
  return (
    <Text
      color={'grey.200'}
      fontSize={{ base: 'xs-12', md: 'xs-14' }}
      fontWeight={'normal'}
      lineHeight={{ base: 'xs-12', md: 'sh-18' }}
      width={'25'}
    >
      {propertyName}
    </Text>
  );
};

const DataSource = ({ dataSource }: { dataSource: DataSource }) => {
  const { provider, name, externalSourceId, version } = dataSource;
  return (
    <Flex direction={'column'} py={'5'} px={'6'}>
      <Flex gap={'3'}>
        <Box height={{ base: '4', md: '6' }} width={{ base: '4', md: '6' }}>
          <Image
            src={provider === Provider.GOOGLE ? gaLogo : mixpanelLogo}
            alt="provider"
            layout="responsive"
          />
        </Box>
        <Text
          fontSize={{ base: 'xs-14', md: 'base' }}
          lineHeight={{ base: 'base', md: 'xs-14' }}
          fontWeight={'medium'}
        >
          {name || externalSourceId}
        </Text>
      </Flex>
      <Flex pl={'9'} mt={'2'} gap={'5'}>
        <ProviderProperty propertyName={Provider.getDisplayName(provider)} />
        {provider === Provider.GOOGLE && (
          <>
            <ProviderProperty propertyName={externalSourceId} />
            <ProviderProperty propertyName={version} />
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default DataSource;
