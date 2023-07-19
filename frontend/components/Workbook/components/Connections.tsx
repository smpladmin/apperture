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
  useDisclosure,
} from '@chakra-ui/react';
import React, { Fragment, useEffect, useState } from 'react';
import APIIcon from '@assets/images/api.svg';
import CSVIcon from '@assets/images/csv.svg';
import AppertureIcon from '@assets/images/apperture-filled-logo.svg';
import DatabaseIcon from '@assets/images/database.svg';
import MixpanelIcon from '@assets/images/mixpanel-new.svg';
import GAIcon from '@assets/images/ga-logo-small.svg';
import AmplitudeIcon from '@assets/images/amplitude-icon.svg';
import ClevertapIcon from '@assets/images/clevertap-icon.png';
import Image from 'next/image';
import { MagnifyingGlass, Table } from 'phosphor-react';
import ConfirmationModal from './ConfirmationModal';
import { TransientSheetData } from '@lib/domain/workbook';

type ConnectionsProps = {
  connections: any[];
  sheetsData: TransientSheetData[];
  setSheetsData: Function;
  selectedSheetIndex: number;
  setConnectorData: Function;
  setShowColumns: Function;
  setShowSqlEditor: Function;
};

const Connections = ({
  connections,
  sheetsData,
  setSheetsData,
  selectedSheetIndex,
  setConnectorData,
  setShowColumns,
  setShowSqlEditor,
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
    };
    return icons[connectionName];
  };
  const { isOpen, onOpen, onClose } = useDisclosure();
  const sheetData = sheetsData[selectedSheetIndex];

  const [canditate, setCandidate] = useState<{
    confirmation: boolean;
    dsId: string;
  }>({
    confirmation: false,
    dsId: '',
  });

  const handleConnectionSelect = (
    connectionData: any,
    heirarchy: string[],
    currentSelectedDsId: string
  ) => {
    /*
      open confirmation modal when switching to different connection when sheet is not in edit mode.
      Note: initally dsId would be empty, in that case show connectorColumns directly
    */
    const lastSelectedDsId = sheetData?.meta?.dsId;
    if (
      lastSelectedDsId &&
      !sheetData.editMode &&
      lastSelectedDsId !== currentSelectedDsId
    ) {
      onOpen();
    } else {
      setShowColumns(true);
      setSheetsData((prevSheetData: TransientSheetData[]) => {
        const tempSheetsData = [...prevSheetData];
        tempSheetsData[selectedSheetIndex].meta.dsId = currentSelectedDsId;
        return tempSheetsData;
      });
    }

    setCandidate((prevCandidate) => ({
      ...prevCandidate,
      dsId: currentSelectedDsId,
    }));
    setConnectorData({ ...connectionData, heirarchy });
    setShowSqlEditor(false);
  };

  const handleSubmit = () => {
    setCandidate((prevCandidate) => ({
      ...prevCandidate,
      confirmation: true,
    }));
    onClose();
  };

  const handleClose = () => {
    setCandidate((prevCandidate) => ({
      ...prevCandidate,
      confirmation: false,
    }));
    onClose();
  };

  useEffect(() => {
    // only upon submission, set dsId in meta and reset selected columns
    // and then show connector columns
    if (canditate.confirmation) {
      setSheetsData((prevSheetData: TransientSheetData[]) => {
        const tempSheetsData = [...prevSheetData];
        tempSheetsData[selectedSheetIndex].meta.dsId = canditate.dsId;
        tempSheetsData[selectedSheetIndex].meta.selectedColumns = [];
        return tempSheetsData;
      });
      setShowColumns(true);
    }
  }, [canditate]);

  return (
    <>
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
            disabled={true}
          />
        </InputGroup>
        {connections.map((connection) => {
          const { server, connection_data } = connection;

          return (
            <Flex direction={'column'} key={server} overflow={'auto'}>
              <Flex alignItems={'center'} py={'2'} px={'3'} mt={'3'}>
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'500'}
                  color={'grey.600'}
                >
                  {server}
                </Text>
                <Divider orientation="horizontal" color={'grey.400'} />
              </Flex>
              <Accordion allowMultiple defaultIndex={[]}>
                {connection_data.map((dataGroup: any, index: number) => {
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
                          {connection_source
                            .slice(0, 5)
                            .map((source: any, index: number) => {
                              const heirarchy = [server, provider, source.name];
                              const currentSelectedDsId = source.datasource_id;
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
                                    handleConnectionSelect(
                                      source,
                                      heirarchy,
                                      currentSelectedDsId
                                    );
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
                            })}
                          {connection_source.length > 5 ? (
                            <Text
                              fontSize={'xs-10'}
                              lineHeight={'xs-10'}
                              fontWeight={'500'}
                              color={'black.DEFAULT'}
                              ml={'9'}
                              mt={'2'}
                            >
                              {`+ ${connection_source.length - 5} more`}
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
      <ConfirmationModal
        isOpen={isOpen}
        onClose={handleClose}
        headerText="Do you want to switch connection?"
        subHeaderText="After changing connection, you will lose all your previous data. Do you want to continue?"
        onSubmit={handleSubmit}
      />
    </>
  );
};

export default Connections;
