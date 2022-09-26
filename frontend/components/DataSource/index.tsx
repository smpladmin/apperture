import { Box, Flex, IconButton, Radio, Text } from '@chakra-ui/react';
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
      width={{ base: 'auto', md: '25' }}
    >
      {propertyName}
    </Text>
  );
};

type DataSourceProps = {
  dataSource: DataSource;
  hasRadio?: boolean;
  isSelected?: boolean;
};

const DataSource = ({ dataSource, hasRadio, isSelected }: DataSourceProps) => {
  const { _id, provider, name, externalSourceId, version } = dataSource;
  return (
    <Flex
      w={'full'}
      cursor={'pointer'}
      alignItems={'center'}
      justifyContent={'space-between'}
      gap={'3'}
      as={hasRadio ? 'label' : undefined}
      bg={isSelected ? 'white.100' : ''}
      px={hasRadio ? '3' : '0'}
    >
      <Flex direction={'column'} py={'5'} gap={'1'}>
        <Flex gap={'3'} alignItems={'center'}>
          <Box height={'6'} width={'6'}>
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
        <Flex pl={'9'} gap={'5'}>
          <ProviderProperty propertyName={Provider.getDisplayName(provider)} />
          {provider === Provider.GOOGLE && (
            <>
              <ProviderProperty propertyName={externalSourceId} />
              <ProviderProperty propertyName={version} />
            </>
          )}
        </Flex>
      </Flex>
      {hasRadio ? (
        <Radio ml={'auto'} value={_id} colorScheme={'radioBlack'} />
      ) : (
        <IconButton
          aria-label="more"
          variant={'secondary'}
          icon={<i className="ri-more-2-line"></i>}
          bg={'white.DEFAULT'}
          minW={0}
          _hover={{
            bg: 'white.DEFAULT',
          }}
          opacity={0}
        />
      )}
    </Flex>
  );
};

export default DataSource;
