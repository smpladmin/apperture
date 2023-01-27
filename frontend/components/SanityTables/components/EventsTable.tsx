import {
  Box,
  Button,
  Flex,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Text,
  Tr,
} from '@chakra-ui/react';
import { SanityData } from '@lib/domain/eventData';
import {
  createColumnHelper,
  flexRender,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table';
import { useMemo } from 'react';

type EventsTablesProps = { eventData: SanityData; selectedColumns: string[] };

const EventsTables = ({ eventData, selectedColumns }: EventsTablesProps) => {
  const columnHelper = createColumnHelper();

  const columns = useMemo(() => {
    const generateColumnHeader = () => {
      return selectedColumns.map((key: any) =>
        columnHelper.accessor(key, {
          header: key,
          cell: (info) => info.getValue(),
        })
      );
    };
    return [...generateColumnHeader()];
  }, [selectedColumns, eventData]);

  const tableInstance = useReactTable({
    columns,
    data: eventData.data || [],
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
    <Box
      borderRadius={'12'}
      mt={'4'}
      borderWidth={'0.4px'}
      borderColor={'grey.100'}
    >
      <Flex
        minH={'15'}
        p={'4'}
        justifyContent={'space-between'}
        alignItems={'center'}
        width={'100%'}
      >
        <Flex gap={'1'}>
          <Text
            fontSize={'xs-14'}
            lineHeight={'xs-18'}
            fontWeight={'500'}
            color={'grey.100'}
          >
            Showing:
          </Text>

          <Text
            fontSize={'xs-14'}
            lineHeight={'xs-18'}
            fontWeight={'500'}
            data-testid="sanity-table-count"
          >
            {eventData.count || 0} Records
          </Text>
        </Flex>
        <Flex gap={'1'}>
          <Button
            _hover={{
              bg: 'white.100',
            }}
            bg={'none'}
            gap={2}
          >
            <Text fontSize={'xs-14'} fontWeight={500}>
              Event Stream
            </Text>
          </Button>
        </Flex>
      </Flex>

      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        overflow={'auto'}
      >
        {eventData?.data?.length ? (
          <Table>
            <Thead py={'3'} px={'8'} bg={'white.100'}>
              {getHeaderGroups().map((headerGroup, groupIndex) => (
                <Tr key={headerGroup.id + groupIndex}>
                  {headerGroup.headers.map((header, index) => {
                    return (
                      <Th key={header.id + index}>
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                      </Th>
                    );
                  })}
                </Tr>
              ))}
            </Thead>
            <Tbody>
              {getRowModel().rows.map((row, index) => (
                <Tr
                  key={row.id + index}
                  _hover={{ bg: 'white.100', cursorTo: 'pointer' }}
                  data-testid="sanity-table-body-rows"
                >
                  {row.getVisibleCells().map((cell, cellIndex) => {
                    return (
                      <Td key={cell.id + cellIndex}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </Td>
                    );
                  })}
                </Tr>
              ))}
            </Tbody>
          </Table>
        ) : (
          <Flex w={'full'} justifyContent={'center'} py={'2'}>
            <Text fontSize={'xs-14'} lineHeight={'xs-18'} fontWeight={'500'}>
              No data found
            </Text>
          </Flex>
        )}
      </Flex>
    </Box>
  );
};

export default EventsTables;
