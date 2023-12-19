import { Box, Button, Flex, Input, Link, Select, Text } from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import { getTableName } from '@components/Scripts/util';
import {
  APIMeta,
  ActionMeta,
  ActionType,
  GoogleSheetMeta,
  TableMeta,
} from '@lib/domain/datamartActions';
import {
  getGoogleSpreadsheets,
  getSpreadsheetSheets,
} from '@lib/services/datamartActionService';
import { GREY_600 } from '@theme/index';
import { BACKEND_BASE_URL, FRONTEND_BASE_URL } from 'config';
import { useRouter } from 'next/router';
import { CaretDown } from 'phosphor-react';
import React, { useEffect, useState } from 'react';

type ConfigurationProps = {
  selectedAction: ActionType | undefined;
  meta: ActionMeta | {};
  setMeta: React.Dispatch<React.SetStateAction<ActionMeta | {}>>;
  isAuthenticated?: boolean;
  datamartId: string;
  workbookName: string;
};

const Configuration = ({
  selectedAction,
  meta,
  setMeta,
  isAuthenticated = false,

  datamartId,
  workbookName,
}: ConfigurationProps) => {
  const router = useRouter();
  const { dsId, showActionDrawer } = router.query;
  const Outh_Link = `${BACKEND_BASE_URL}/datamart/oauth/google?redirect_url=${FRONTEND_BASE_URL}/analytics/datamart/edit/${datamartId}?showActionDrawer=1&dsId=${dsId}`;

  if (selectedAction === ActionType.GOOGLE_SHEET) {
    const [loadingSpreadsheets, setLoadingSpreadsheets] = useState(false);
    const [loadingSheets, setLoadingSheets] = useState(false);

    const [sheetNames, setSheetNames] = useState<string[]>([]);
    const [spreadsheets, setSpreadsheets] = useState<
      Array<{
        id: string;
        name: string;
      }>
    >([]);

    const spreadsheetId = (meta as GoogleSheetMeta)?.spreadsheet?.id;

    useEffect(() => {
      const getSpreadsheets = async () => {
        setLoadingSpreadsheets(true);
        const res = await getGoogleSpreadsheets();
        setSpreadsheets(res?.data || []);
        setLoadingSpreadsheets(false);
      };
      getSpreadsheets();
    }, []);

    useEffect(() => {
      if (!spreadsheetId) return;

      const getSheets = async () => {
        setLoadingSheets(true);
        const res = await getSpreadsheetSheets(spreadsheetId);
        setSheetNames(res?.data || []);
        setLoadingSheets(false);
      };
      getSheets();
    }, [spreadsheetId]);

    return (
      <Box mt={'4'}>
        {isAuthenticated || showActionDrawer ? (
          <Flex direction="column" gap={'7'}>
            <Flex direction="column" gap={'2'}>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'400'}
                color={'grey.800'}
              >
                Select spreadsheet
              </Text>
              <Flex gap={'2'}>
                <Select
                  width={'70'}
                  size={'md'}
                  icon={<CaretDown fontSize={'12px'} color={GREY_600} />}
                  placeholder="Choose a spreadsheet"
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                  border={'0.4px solid #BDBDBD'}
                  focusBorderColor={'grey.900'}
                  value={(meta as GoogleSheetMeta)?.spreadsheet?.id || ''}
                  onChange={(e) => {
                    const id = e.target.value;
                    const { name } = spreadsheets.find(
                      (sheet) => sheet.id === id
                    )!!;
                    setMeta((prevMeta: GoogleSheetMeta) => {
                      return {
                        ...prevMeta,
                        spreadsheet: { id, name },
                        sheet: '',
                      };
                    });
                  }}
                >
                  {spreadsheets.map((spreadsheet) => {
                    return (
                      <option key={spreadsheet.id} value={spreadsheet.id}>
                        {spreadsheet.name}
                      </option>
                    );
                  })}
                </Select>
                {loadingSpreadsheets ? <LoadingSpinner size={'md'} /> : null}
              </Flex>
            </Flex>

            <Flex direction="column" gap={'2'}>
              <Text
                fontSize={'xs-12'}
                lineHeight={'xs-12'}
                fontWeight={'400'}
                color={'grey.800'}
              >
                Select sheet
              </Text>
              <Flex gap={'2'}>
                <Select
                  width={'70'}
                  icon={<CaretDown fontSize={'12px'} color={GREY_600} />}
                  size={'md'}
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                  border={'0.4px solid #BDBDBD'}
                  placeholder="Choose a sheet"
                  focusBorderColor={'grey.900'}
                  value={(meta as GoogleSheetMeta)?.sheet || ''}
                  onChange={(e) => {
                    const sheet = e.target.value;
                    setMeta((prevMeta: GoogleSheetMeta) => {
                      return { ...prevMeta, sheet };
                    });
                  }}
                >
                  {sheetNames.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </Select>
                {loadingSheets ? <LoadingSpinner size={'md'} /> : null}
              </Flex>
            </Flex>
          </Flex>
        ) : (
          <Link href={Outh_Link}>
            <Button
              bg={'black'}
              color={'white.DEFAULT'}
              _hover={{ bg: 'grey.800' }}
            >
              Connect to Google Sheets
            </Button>
          </Link>
        )}
      </Box>
    );
  }

  if (selectedAction === ActionType.API) {
    return (
      <Flex direction="column" gap={'7'} mt={'4'}>
        <Flex direction="column" gap={'2'}>
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'400'}
            color={'grey.800'}
          >
            API end point
          </Text>
          <Input
            id="endPoint"
            size={'lg'}
            width={'70'}
            bg={'white.100'}
            rounded={'0.25rem'}
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            color={'grey.900'}
            placeholder="Enter your API end point"
            py={4}
            px={4}
            focusBorderColor={'black.100'}
            border={'1px'}
            borderColor={'grey.700'}
            value={(meta as APIMeta)?.url || ''}
            onChange={(e) =>
              setMeta((prevMeta: APIMeta) => {
                return { ...prevMeta, url: e.target.value };
              })
            }
          />
        </Flex>

        <Flex direction="column" gap={'2'}>
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'400'}
            color={'grey.800'}
          >
            Headers
          </Text>
          <Input
            id="headers"
            size={'lg'}
            width={'70'}
            bg={'white.100'}
            rounded={'0.25rem'}
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            color={'grey.900'}
            placeholder="Enter your headers as string"
            py={4}
            px={4}
            focusBorderColor={'black.100'}
            border={'1px'}
            borderColor={'grey.700'}
            value={(meta as APIMeta)?.headers || ''}
            onChange={(e) =>
              setMeta((prevMeta: APIMeta) => {
                return { ...prevMeta, headers: e.target.value };
              })
            }
          />
        </Flex>
      </Flex>
    );
  }
  if (selectedAction === ActionType.TABLE) {
    return (
      <Flex direction="column" gap={'7'} mt={'4'}>
        <Flex direction="column" gap={'2'}>
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'400'}
            color={'grey.900'}
          >
            Warehouse: Clickhouse
          </Text>
          <Text
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            fontWeight={'400'}
            color={'grey.800'}
          >
            Table name
          </Text>
          <Input
            id="endPoint"
            size={'lg'}
            width={'70'}
            bg={'white.100'}
            rounded={'0.25rem'}
            fontSize={'xs-12'}
            lineHeight={'xs-12'}
            color={'grey.900'}
            placeholder="Enter table name"
            py={4}
            px={4}
            focusBorderColor={'black.100'}
            border={'1px'}
            borderColor={'grey.700'}
            value={(meta as TableMeta)?.name || getTableName(workbookName)}
            onChange={(e) => {
              setMeta((prevMeta: APIMeta) => {
                return { ...prevMeta, name: e.target.value };
              });
            }}
          />
        </Flex>
      </Flex>
    );
  }
  return <></>;
};

export default Configuration;
