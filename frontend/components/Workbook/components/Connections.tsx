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
} from '@chakra-ui/react';
import React, { Fragment } from 'react';
import { connections } from './connectionsData';
import APIIcon from '@assets/images/api.svg';
import CSVIcon from '@assets/images/csv.svg';
import AppertureIcon from '@assets/images/apperture-filled-logo.svg';
import DatabaseIcon from '@assets/images/database.svg';
import MixpanelIcon from '@assets/images/mixpanel-new.svg';
import GAIcon from '@assets/images/ga-logo-small.svg';
import Image from 'next/image';
import { MagnifyingGlass, Table } from 'phosphor-react';

type ConnectionsProps = {
  setConnectorData: Function;
  setShowColumns: Function;
};

const Connections = ({
  setConnectorData,
  setShowColumns,
}: ConnectionsProps) => {
  const getConnectionIcon = (connectionName: string) => {
    const icons: { [key: string]: any } = {
      Mixpanel: MixpanelIcon,
      API: APIIcon,
      Google: GAIcon,
      Apperture: AppertureIcon,
      Database: DatabaseIcon,
      CSV: CSVIcon,
    };
    return icons[connectionName];
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
          boxShadow={
            '0px 0px 0px 0px rgba(0, 0, 0, 0.06), 0px 1px 1px 0px rgba(0, 0, 0, 0.06), 0px 3px 3px 0px rgba(0, 0, 0, 0.05), 0px 6px 3px 0px rgba(0, 0, 0, 0.03), 0px 10px 4px 0px rgba(0, 0, 0, 0.01), 0px 16px 4px 0px rgba(0, 0, 0, 0.00)'
          }
          borderColor={'white.200'}
          placeholder="Search for tables..."
          _placeholder={{
            fontSize: 'xs-12',
            lineHeight: 'xs-12',
            fontWeight: '400',
            color: 'grey.700',
          }}
          focusBorderColor="black.100"
        />
      </InputGroup>
      {connections.map((connection) => {
        const { group: connectionClass, data } = connection;

        return (
          <Flex direction={'column'} key={connectionClass}>
            <Flex alignItems={'center'} py={'2'} px={'3'} mt={'3'}>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'500'}
                color={'grey.600'}
              >
                {connectionClass}
              </Text>
              <Divider orientation="horizontal" color={'grey.400'} />
            </Flex>
            <Accordion allowMultiple defaultIndex={[]}>
              {data.map((dataGroup, index) => {
                const { data: accountData, group: connectionAccount } =
                  dataGroup;

                return (
                  <Fragment key={connectionAccount + index}>
                    <AccordionItem border={0}>
                      <AccordionButton px={'3'} py={'2'} borderRadius={'8'}>
                        <Box flex="1" textAlign="left">
                          <Flex gap={'2'}>
                            <Image
                              src={getConnectionIcon(connectionAccount)}
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
                              {connectionAccount}
                            </Text>
                          </Flex>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                      <AccordionPanel p={0}>
                        {accountData.slice(0, 5).map((account, index) => {
                          const heirarchy = [
                            connectionClass,
                            connectionAccount,
                          ];
                          return (
                            <Flex
                              key={account.name + index}
                              px={'3'}
                              py={'2'}
                              gap={'2'}
                              cursor={'pointer'}
                              _hover={{ bg: 'white.200' }}
                              borderRadius={'8'}
                              onClick={() => {
                                setShowColumns(true);
                                setConnectorData({ ...account, heirarchy });
                              }}
                            >
                              <Table size={16} weight="thin" />
                              <Text
                                fontSize={'xs-12'}
                                lineHeight={'xs-12'}
                                fontWeight={'500'}
                                color={'grey.900'}
                              >
                                {account.name}
                              </Text>
                            </Flex>
                          );
                        })}
                        {accountData.length > 5 ? (
                          <Text
                            fontSize={'xs-10'}
                            lineHeight={'xs-10'}
                            fontWeight={'500'}
                            color={'black.DEFAULT'}
                            ml={'9'}
                            mt={'2'}
                          >
                            {`+ ${accountData.length - 5} more`}
                          </Text>
                        ) : null}
                      </AccordionPanel>
                    </AccordionItem>
                  </Fragment>
                );
              })}
            </Accordion>
          </Flex>
        );
      })}
    </Flex>
  );
};

export default Connections;
