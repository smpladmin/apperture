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
      fontSize={'xs-14'}
      fontWeight={'normal'}
      lineHeight={'sh-18'}
      width={'25'}
    >
      {propertyName}
    </Text>
  );
};

const DataSource = ({ dataSource }: { dataSource: DataSource }) => {
  const { provider, name } = dataSource;
  return (
    <Flex direction={'column'} py={'5'} px={6}>
      <Flex gap={'3'}>
        <Box height={{ base: '6', md: '6' }} width={{ base: '6', md: '6' }}>
          <Image
            src={provider === Provider.GOOGLE ? gaLogo : mixpanelLogo}
            alt="google analytics"
            layout="responsive"
          />
        </Box>
        <Text>{name || 'MixPanel'}</Text>
      </Flex>
      <Flex pl={'9'} mt={'2'} gap={'5'}>
        <ProviderProperty propertyName={Provider.getDisplayName(provider)} />
        {provider === Provider.GOOGLE && (
          <>
            <ProviderProperty propertyName={dataSource.externalSourceId!!} />
            <ProviderProperty propertyName={dataSource.version} />
          </>
        )}
      </Flex>
    </Flex>
  );
};

export default DataSource;
