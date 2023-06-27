import {
  Box,
  Button,
  Flex,
  Input,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@chakra-ui/react';
import Details from '@components/Watchlist/Table/Details';
import { SavedItems, WatchListItemType } from '@lib/domain/watchlist';
import {
  Row,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useRouter } from 'next/router';
import { CaretDown } from 'phosphor-react';
import React, { useEffect, useMemo, useState } from 'react';
import Actions from './Actions';
import UserInfo from './UserInfo';
import UpdatedAt from './UpdatedAt';
import { AppWithIntegrations } from '@lib/domain/app';
import {
  deleteWorkbook,
  getSavedWorkbooksForApp,
} from '@lib/services/workbookService';
import {
  deleteMetric,
  getSavedMetricsForApp,
} from '@lib/services/metricService';
import {
  deleteFunnel,
  getSavedFunnelsForApp,
} from '@lib/services/funnelService';
import {
  deleteSegment,
  getSavedSegmentsForApp,
} from '@lib/services/segmentService';
import { addItemTypeToSavedItems, getAppId } from '@components/Home/util';
import LoadingSpinner from '@components/LoadingSpinner';
import Explorations from './Explorations';

const ListingTable = ({ apps }: { apps: AppWithIntegrations[] }) => {
  const [savedLibraryItems, setSavedLibraryItems] = useState<SavedItems[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { dsId } = router.query;

  useEffect(() => {
    const fetchSavedItems = async () => {
      const appId = getAppId(apps, dsId as string);

      const [savedWorkbooks, savedMetrics, savedFunnels, savedSegments] =
        await Promise.all([
          getSavedWorkbooksForApp(appId),
          getSavedMetricsForApp(appId),
          getSavedFunnelsForApp(appId),
          getSavedSegmentsForApp(appId),
        ]);

      const sortedLibraryItems = [
        ...addItemTypeToSavedItems(WatchListItemType.WORKBOOKS, savedWorkbooks),
        ...addItemTypeToSavedItems(WatchListItemType.METRICS, savedMetrics),
        ...addItemTypeToSavedItems(WatchListItemType.FUNNELS, savedFunnels),
        ...addItemTypeToSavedItems(WatchListItemType.SEGMENTS, savedSegments),
      ].sort(
        (a, b) =>
          new Date(b.details.updatedAt).valueOf() -
          new Date(a.details.updatedAt).valueOf()
      );

      setSavedLibraryItems(sortedLibraryItems);
      setIsLoading(false);
    };

    setIsLoading(true);
    fetchSavedItems();
  }, []);

  const onRowClick = (row: Row<SavedItems>) => {
    const { _id, datasourceId } = row?.original?.details;
    const type = row?.original?.type;

    const path = WatchListItemType.toURLPath(type as WatchListItemType);

    router.push({
      pathname: `/analytics/${path}/[id]`,
      query: { id: _id, dsId: datasourceId },
    });
  };

  const handleDelete = async (id: string, type: WatchListItemType) => {
    switch (type) {
      case WatchListItemType.WORKBOOKS:
        await deleteWorkbook(id);
        break;
      case WatchListItemType.METRICS:
        await deleteMetric(id, dsId as string);
        break;
      case WatchListItemType.FUNNELS:
        await deleteFunnel(id, dsId as string);
        break;
      case WatchListItemType.SEGMENTS:
        await deleteSegment(id);
        break;
      default:
        break;
    }
  };

  const savedItemsLength = savedLibraryItems.length;
  const columnHelper = createColumnHelper<SavedItems>();
  const columns = useMemo(
    () => [
      columnHelper.accessor('details', {
        header: `Explorations (${savedItemsLength})`,
        cell: (info) => <Explorations info={info} />,
      }),
      columnHelper.accessor('details.user', {
        cell: (info) => <UserInfo info={info} />,
        header: 'Created By',
      }),
      columnHelper.accessor('details.updatedAt', {
        cell: (info) => <UpdatedAt info={info} />,
        header: 'Last modified',
      }),
      columnHelper.accessor('details._id', {
        cell: (info) => <Actions info={info} handleDelete={handleDelete} />,
        header: '',
      }),
    ],
    []
  );

  const tableInstance = useReactTable({
    columns,
    data: savedLibraryItems,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  const { getHeaderGroups, getRowModel } = tableInstance;

  return (
    <Box pt={10} maxW={336} w={'full'} margin={'auto'}>
      <Text fontWeight={700} fontSize={'base'} lineHeight={'base'}>
        Your Library
      </Text>
      <Flex
        mt={5}
        justifyContent={'space-between'}
        flexDirection={'row'}
        alignItems={'center'}
      >
        <Input placeholder="Search" maxW={88}></Input>
        <Flex gap={3}>
          <Button
            display={'flex'}
            alignItems={'center'}
            gap={2}
            fontWeight={500}
            fontSize={'xs-12'}
            lineHeight={'lh-130'}
            paddingY={2}
            paddingLeft={4}
            paddingRight={3}
            variant={'unstyled'}
          >
            All Explorations <CaretDown />
          </Button>
          <Button
            display={'flex'}
            alignItems={'center'}
            gap={2}
            fontWeight={500}
            fontSize={'xs-12'}
            lineHeight={'lh-130'}
            paddingY={2}
            paddingLeft={4}
            paddingRight={3}
            variant={'unstyled'}
          >
            Created by Anyone <CaretDown />
          </Button>
          <Button
            display={'flex'}
            alignItems={'center'}
            gap={2}
            fontWeight={500}
            fontSize={'xs-12'}
            lineHeight={'lh-130'}
            paddingY={2}
            paddingLeft={4}
            paddingRight={3}
            variant={'unstyled'}
          >
            Latest First <CaretDown />
          </Button>
        </Flex>
      </Flex>

      {isLoading ? (
        <Flex
          justifyContent={'center'}
          alignItems={'center'}
          w={'full'}
          h={'full'}
        >
          <LoadingSpinner />
        </Flex>
      ) : (
        <Table data-testid={'watchlist-table'}>
          <Thead py={'3'} px={'8'} bg={'white.100'}>
            {getHeaderGroups().map((headerGroup) => (
              <Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <Th key={header.id} data-testid={'watchlist-table-headers'}>
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
            {getRowModel().rows.map((row) => (
              <Tr
                key={row.id}
                onClick={() => onRowClick(row)}
                _hover={{ bg: 'white.100', cursor: 'pointer' }}
                data-testid={'table-body-rows'}
              >
                {row.getVisibleCells().map((cell) => {
                  return (
                    <Td key={cell.id}>
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
      )}
    </Box>
  );
};

export default ListingTable;
