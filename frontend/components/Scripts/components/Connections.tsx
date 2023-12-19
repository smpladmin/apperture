import React, { Fragment } from 'react';
import APIIcon from '@assets/images/api.svg';
import CSVIcon from '@assets/images/csv.svg';
import AppertureIcon from '@assets/images/apperture-filled-logo.svg';
import DatabaseIcon from '@assets/images/database.svg';
import MixpanelIcon from '@assets/images/mixpanel-new.svg';
import GAIcon from '@assets/images/ga-logo-small.svg';
import AmplitudeIcon from '@assets/images/amplitude-icon.svg';
import ClevertapIcon from '@assets/images/clevertap-icon.png';
import BranchIcon from '@assets/images/branch.png';
import GoogleAds from '@assets/images/google-ads.svg';
import FacebookLogo from '@assets/images/facebook-logo.svg';
import Image from 'next/image';
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Skeleton,
} from '@chakra-ui/react';
import { MagnifyingGlass, Table } from 'phosphor-react';
import {
  Connection,
  ConnectionGroup,
  ConnectionSource,
} from '@lib/domain/connections';

type ConnectionsProps = {
  loadingConnections: boolean;
  connections: Connection[];
  setShowColumns: React.Dispatch<React.SetStateAction<boolean>>;
  setConnectorData: React.Dispatch<
    React.SetStateAction<
      ConnectionSource & {
        heirarchy: string[];
      }
    >
  >;
};

const Connections = ({
  loadingConnections,
  connections,
  setShowColumns,
  setConnectorData,
}: ConnectionsProps) => {
  const getConnectionIcon = (connectionName: string) => {
    const icons: { [key: string]: any } = {
      mixpanel: MixpanelIcon,
      amplitude: AmplitudeIcon,
      clevertap: ClevertapIcon,
      api: APIIcon,
      google: GAIcon,
      apperture: AppertureIcon,
      mysql: DatabaseIcon,
      csv: CSVIcon,
      branch: BranchIcon,
      google_ads: GoogleAds,
      facebook_ads: FacebookLogo,
    };
    return icons[connectionName] || DatabaseIcon;
  };

  const handleConnectionSelect = (
    connectionData: ConnectionSource,
    heirarchy: string[]
  ) => {
    setShowColumns(true);
    setConnectorData({ ...connectionData, heirarchy });
  };

  return (
    <Flex direction={'column'} mt={'2'}>
      <InputGroup>
        <InputLeftElement>
          <MagnifyingGlass size={12} weight="thin" />
        </InputLeftElement>
        <Input
          bg={'white.DEFAULT'}
          borderRadius={'8'}
          borderColor={'white.200'}
          placeholder="Search for tables..."
          _placeholder={{
            fontSize: 'xs-12',
            lineHeight: 'xs-12',
            fontWeight: '400',
            color: 'grey.700',
          }}
          focusBorderColor="black.100"
          disabled={true}
        />
      </InputGroup>
      {loadingConnections ? (
        <Flex direction={'column'} gap={'6'} p={'4'}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton
              key={i}
              height={'4'}
              fadeDuration={1}
              bg={'white.400'}
              opacity={'0.3'}
            />
          ))}
        </Flex>
      ) : null}
      {connections.map((connection) => {
        const { server, connection_data } = connection;

        return (
          <Flex direction={'column'} key={server} overflow={'auto'}>
            <Flex alignItems={'center'} py={'2'} px={'3'} mt={'3'}>
              <Text
                as={'span'}
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'500'}
                color={'grey.600'}
                whiteSpace={'nowrap'}
                mr={1}
              >
                {server}
              </Text>
              <Divider orientation="horizontal" color={'grey.400'} />
            </Flex>
            <Accordion allowMultiple defaultIndex={[]}>
              {connection_data.map(
                (dataGroup: ConnectionGroup, index: number) => {
                  const { provider, connection_source } = dataGroup;

                  return (
                    <Fragment key={provider + index}>
                      <AccordionItem border={0}>
                        <AccordionButton px={'3'} py={'2'} borderRadius={'8'}>
                          <Box flex="1" textAlign="left">
                            <Flex gap={'2'}>
                              <Image
                                src={getConnectionIcon(provider)}
                                width={'16'}
                                height={'16'}
                                style={{
                                  minWidth: '16px',
                                  minHeight: '16px',
                                }}
                                alt={'group'}
                              />
                              <Text
                                fontSize={'xs-12'}
                                lineHeight={'xs-12'}
                                fontWeight={'500'}
                                color={'grey.500'}
                              >
                                {provider}
                              </Text>
                            </Flex>
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel p={0}>
                          {connection_source.map(
                            (source: ConnectionSource, index: number) => {
                              const heirarchy = [server, provider, source.name];
                              return (
                                <Flex
                                  key={source.name + index}
                                  px={'3'}
                                  py={'2'}
                                  gap={'2'}
                                  cursor={'pointer'}
                                  _hover={{ bg: 'white.200' }}
                                  borderRadius={'8'}
                                  onClick={() => {
                                    handleConnectionSelect(source, heirarchy);
                                  }}
                                >
                                  <Table size={16} weight="thin" />
                                  <Text
                                    fontSize={'xs-12'}
                                    lineHeight={'xs-12'}
                                    fontWeight={'500'}
                                    color={'grey.900'}
                                  >
                                    {source.name}
                                  </Text>
                                </Flex>
                              );
                            }
                          )}
                        </AccordionPanel>
                      </AccordionItem>
                    </Fragment>
                  );
                }
              )}
            </Accordion>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default Connections;
