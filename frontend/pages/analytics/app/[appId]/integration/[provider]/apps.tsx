import 'remixicon/fonts/remixicon.css';
import gaIcon from '@assets/images/ga-icon.png';
import {
  Box,
  Flex,
  Heading,
  IconButton,
  Stack,
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
import { useState } from 'react';
import FormButton from '@components/FormButton';

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
  const { appId, provider, add } = router.query;
  const handleClose = () => router.push('/analytics/explore?apps=1');

  const handleGoBack = () => {
    router.push({
      pathname: '/analytics/app/[appId]/integration/[provider]/create',
      query: { appId: appId, provider: provider },
    });
  };

  const [selectedDataSources, setSelectedDataSources] = useState<Array<string>>(
    []
  );

  const handleSave = async () => {
    const selected = datasources.filter((ds) =>
      selectedDataSources.includes(ds._id)
    );
    const created = await saveDataSources(
      selected,
      router.query.integration_id as string
    );
    router.replace({
      pathname: '/analytics/app/[appId]/integration/[provider]/complete',
      query: {
        appId: router.query.appId,
        provider: router.query.provider,
        dsId: created[0]._id,
      },
    });
  };

  return (
    <Flex
      flexDirection={'column'}
      h={'full'}
      py={{ base: 4, md: 10 }}
      pl={{ base: 4, md: 45 }}
      pr={{ base: 4, md: 'auto' }}
      justifyContent={{ base: 'space-between', md: 'start' }}
    >
      <Box>
        <IconButton
          aria-label="close"
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white'}
          border={'1px'}
          borderColor={'white.200'}
          onClick={handleClose}
        />
        <Box mt={11} w={{ base: 'full' }} maxW={{ md: '200' }}>
          <Image
            src={gaIcon.src}
            alt="Integration completed"
            width={{ base: '13', md: '18' }}
            height={{ base: '13', md: '18' }}
          />
          <Text
            textColor={'grey.200'}
            paddingY={6}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'medium'}
          >
            {add ? 'Step 2 of 2' : 'Step 3 of 3'}
          </Text>
          <Heading
            as={'h2'}
            pb={{ base: 8, md: 10 }}
            fontSize={{ base: 'sh-28', md: 'sh-56' }}
            lineHeight={{ base: 'sh-28', md: 'sh-56' }}
            fontWeight={'semibold'}
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

      <Box mt={10} w={'full'}>
        <FormButton
          navigateBack={handleGoBack}
          handleNextClick={handleSave}
          disabled={!selectedDataSources.length}
          nextButtonName={add ? 'Add Data Source' : 'Create Application'}
        />
      </Box>
    </Flex>
  );
};

export default SelectDataSources;
