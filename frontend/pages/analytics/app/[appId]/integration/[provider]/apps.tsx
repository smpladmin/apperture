import 'remixicon/fonts/remixicon.css';
import gaIcon from '@assets/images/ga-icon.png';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
  Checkbox,
  Text,
  Image,
  CheckboxGroup,
} from '@chakra-ui/react';
import { GetServerSideProps } from 'next';
import {
  saveDataSources,
  _getProviderDatasources,
} from '@lib/services/datasourceService';
import { ProviderDataSource as DataSource } from '@lib/domain/datasource';
import { ProviderDataSource } from '@components/ProviderDataSource';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export const getServerSideProps: GetServerSideProps = async ({
  req,
  query,
}) => {
  const datasources = await _getProviderDatasources(
    req.cookies.auth_token as string,
    query.integration_id as string
  );
  return {
    props: {
      datasources,
    },
  };
};

type SelectDataSourcesProps = {
  datasources: Array<DataSource>;
};

const SelectDataSources = ({ datasources }: SelectDataSourcesProps) => {
  const router = useRouter();

  const handleGoBack = () => {
    router.push({
      pathname: '/analytics/app/[appId]/integration/[provider]/create',
      query: { appId: router.query.appId, provider: router.query.provider },
    });
  };

  const [selectedDataSources, setSelectedDataSources] = useState<Array<string>>(
    []
  );

  const handleSave = async () => {
    const selected = datasources.filter((ds) =>
      selectedDataSources.includes(ds._id)
    );
    await saveDataSources(selected, router.query.integration_id as string);
    router.replace({
      pathname: '/analytics/app/[appId]/integration/[provider]/complete',
      query: { appId: router.query.appId, provider: router.query.provider },
    });
  };

  return (
    <Flex
      h={{ base: 'full', lg: 'auto' }}
      flexDir={'column'}
      p={4}
      px={{ lg: 48 }}
      pt={{ lg: 20 }}
      maxW={{ lg: 'xl' }}
    >
      <Box>
        <IconButton
          aria-label="close"
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white'}
          border={'1px'}
          borderColor={'white.200'}
        />
        <Box mt={11} w={{ sm: 'full' }} maxW={{ lg: 200 }}>
          <Image
            src={gaIcon.src}
            alt="Integration completed"
            width={{ base: '3.25rem', md: '18' }}
            height={{ base: '3.25rem', md: '18' }}
          />
          <Text
            textColor={'grey.200'}
            paddingY={6}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'medium'}
          >
            Step 3 of 3
          </Text>
          <Heading
            as={'h2'}
            fontWeight={'600'}
            pb={{ base: 8, lg: 10 }}
            fontSize={{ base: '1.74rem', lg: '3.5rem' }}
            lineHeight={{ base: '2.125rem', lg: '4.125rem' }}
          >
            Select applications from Google Analytics that you want to track
          </Heading>
        </Box>
        <Stack width={'full'} maxW={125} spacing={6}>
          <CheckboxGroup
            onChange={(selected: Array<string>) =>
              setSelectedDataSources(selected)
            }
          >
            {datasources.map((ds) => {
              return <ProviderDataSource key={ds._id} datasource={ds} />;
            })}
          </CheckboxGroup>
        </Stack>
      </Box>
      <Flex gap={'2'} mt={'10'} w={'full'}>
        <IconButton
          aria-label="back"
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'lg'}
          bg={'white.100'}
          p={6}
          w={'13.5'}
          h={'13.5'}
          onClick={handleGoBack}
        />
        <Button
          disabled={!selectedDataSources.length}
          rounded={'lg'}
          bg={'black.100'}
          p={6}
          fontSize={'base'}
          fontWeight={'semibold'}
          lineHeight={'base'}
          textColor={'white.100'}
          width={{ base: 'full', md: '72' }}
          h={'13.5'}
          onClick={handleSave}
        >
          Create Application
        </Button>
      </Flex>
    </Flex>
  );
};

export default SelectDataSources;
