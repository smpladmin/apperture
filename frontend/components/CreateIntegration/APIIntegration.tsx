import apilogo from '@assets/images/apilogo.png';
import {
  Box,
  Flex,
  Heading,
  Input,
  Text
} from '@chakra-ui/react';
import FormButton from '@components/FormButton';
import {
  IntegrationContainer,
  LeftContainer,
  LeftContainerRevisit,
  RightContainer,
  TopProgress,
} from '@components/Onboarding';
import { Provider } from '@lib/domain/provider';
import { createIntegrationWithDataSource } from '@lib/services/integrationService';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

type APIIntegrationProps = {
  handleClose: Function;
  add: string | string[] | undefined;
};
const APIIntegration = ({ add, handleClose }: APIIntegrationProps) => {
  const router = useRouter();
  const [endPoint, setEndPoint] = useState('');
  const [headers, setHeaders] = useState('');
  const [tableName, setTableName] = useState('');
  const [validData, setValidData] = useState(false);

  const handleGoBack = (): void => router.back();
  useEffect(() => {
    setValidData(!!(endPoint && headers));
  }, [endPoint, headers]);

  const onSubmit = async () => {
    const appId = router.query.appId as string;
    const provider = router.query.provider as Provider;
    const integration = await createIntegrationWithDataSource(
      appId,
      provider,
      endPoint,
      headers,
      '',
      tableName
    );
    router.replace({
      pathname: '/analytics/app/[appId]/integration/[provider]/complete',
      query: {
        appId: router.query.appId,
        provider: router.query.provider,
        dsId: integration.datasource._id,
      },
    });
  };

  return (
    <IntegrationContainer>
      
        { add ? <LeftContainerRevisit/> : <LeftContainer /> }
     
      <RightContainer>
          <Flex
            flexDirection="column"
            alignItems="center"
          >
                  { add ? <Box mt={10}></Box> : <TopProgress handleGoBack={handleGoBack} /> }

                    <Flex
                            direction={'column'}
                            h={'full'}
                            justifyContent={{ base: 'space-between', md: 'start' }}
                          >
                          <Box>
                            
                            <Box height={{ base: 8, md: 14 }} width={{ base: 8, md: 14 }} mb={2}>
                              <Image src={apilogo} alt="api" layout="responsive" />
                            </Box>
                            
                            <Heading
                              as={'h2'}
                              mb={{ base: 8, md: 10 }}
                              fontSize={{ base: 'sh-18', md: 'sh-18' }}
                              lineHeight={{ base: '2.125rem', md: '4.125rem' }}
                              fontWeight={'semibold'}
                              maxW={200}
                            >
                              Enter Details to fetch data from API
                            </Heading>
                            <Box>
                              <Box mb={5}>
                                <Text
                                  as="label"
                                  color="grey.100"
                                  fontSize={'xs-14'}
                                  lineHeight={'xs-14'}
                                  display="block"
                                  htmlFor="endPoint"
                                >
                                  API endPoint
                                </Text>
                                <Input
                                  id="endPoint"
                                  size={'lg'}
                                  width={{ base: 'full', md: 125 }}
                                  bg={'white.100'}
                                  rounded={'0.25rem'}
                                  fontSize={'base'}
                                  lineHeight={'base'}
                                  textColor={'black.400'}
                                  placeholder="Enter your API endPoint"
                                  py={4}
                                  px={3.5}
                                  focusBorderColor={'black.100'}
                                  border={'1px'}
                                  value={endPoint}
                                  onChange={(e) => setEndPoint(e.target.value)}
                                  _placeholder={{
                                    fontSize: '1rem',
                                    lineHeight: '1.375rem',
                                    fontWeight: 400,
                                    color: 'grey.100',
                                  }}
                                />
                              </Box>
                              <Box mb={5}>
                                <Text
                                  as="label"
                                  color="grey.100"
                                  fontSize={'xs-14'}
                                  lineHeight={'xs-14'}
                                  display="block"
                                  htmlFor="headers"
                                >
                                  headers
                                </Text>
                                <Input
                                  id="headers"
                                  size={'lg'}
                                  width={{ base: 'full', md: 125 }}
                                  bg={'white.100'}
                                  rounded={'0.25rem'}
                                  fontSize={'base'}
                                  lineHeight={'base'}
                                  textColor={'black.400'}
                                  placeholder='{"API-Key": "your-api-key"}'
                                  py={4}
                                  px={3.5}
                                  focusBorderColor={'black.100'}
                                  border={'1px'}
                                  value={headers}
                                  onChange={(e) => setHeaders(e.target.value)}
                                  _placeholder={{
                                    fontSize: '1rem',
                                    lineHeight: '1.375rem',
                                    fontWeight: 400,
                                    color: 'grey.100',
                                  }}
                                />
                              </Box>
                              <Box mb={5}>
                                <Text
                                  as="label"
                                  color="grey.100"
                                  fontSize={'xs-14'}
                                  lineHeight={'xs-14'}
                                  display="block"
                                  htmlFor="tableName"
                                >
                                  Table Name
                                </Text>
                                <Input
                                  id="tableName"
                                  size={'lg'}
                                  width={{ base: 'full', md: 125 }}
                                  bg={'white.100'}
                                  rounded={'0.25rem'}
                                  fontSize={'base'}
                                  lineHeight={'base'}
                                  textColor={'black.400'}
                                  placeholder='What would you like to call this table'
                                  py={4}
                                  px={3.5}
                                  focusBorderColor={'black.100'}
                                  border={'1px'}
                                  value={tableName}
                                  onChange={(e) => setTableName(e.target.value)}
                                  _placeholder={{
                                    fontSize: '1rem',
                                    lineHeight: '1.375rem',
                                    fontWeight: 400,
                                    color: 'grey.100',
                                  }}
                                />
                              </Box>
                              
                            </Box>
                          </Box>
                          <Box mb={5}>
                            <FormButton
                              navigateBack={() => router.back()}
                              handleNextClick={() => onSubmit()}
                              disabled={!validData}
                              nextButtonName={add ? 'Add Data Source' : 'Create Application'}
                            />
                          </Box>
                          </Flex>
                        </Flex>
                    </RightContainer>
    </IntegrationContainer>



  );
};

export default APIIntegration;
