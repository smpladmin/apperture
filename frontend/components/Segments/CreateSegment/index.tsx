import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, Text, useDisclosure } from '@chakra-ui/react';
import { SegmentGroup, SegmentTableData } from '@lib/domain/segment';
import QueryBuilder from './components/QueryBuilder';
import SegmentTable from './components/Table/SegmentTable';
import { getEventProperties } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import { computeSegment } from '@lib/services/segmentService';
import { getFilteredColumns } from '../util';
import SaveSegmentModal from './components/SaveModal';
import { User } from '@lib/domain/user';
import { getUserInfo } from '@lib/services/userService';

const CreateSegment = () => {
  const [groups, setGroups] = useState<SegmentGroup[]>([]);
  const [eventProperties, setEventProperties] = useState([]);
  const [loadingEventProperties, setLoadingEventProperties] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(['user_id']);
  const [userTableData, setUserTableData] = useState<SegmentTableData>({
    count: 0,
    data: [],
  });
  const [isSegmentDataLoading, setIsSegmentDataLoading] = useState(false);
  const [refreshOnDelete, setRefreshOnDelete] = useState(false);
  const [user, setUser] = useState<User>();
  const {
    isOpen: isSaveSegmentModalOpen,
    onOpen: openSaveSegmentModal,
    onClose: closeSaveSegmentModal,
  } = useDisclosure();

  const router = useRouter();
  const { dsId } = router.query;

  const fetchSegmentResponse = async (columns: string[]) => {
    const data = await computeSegment(dsId as string, groups, columns);
    setUserTableData(data);
    setIsSegmentDataLoading(false);
  };

  useEffect(() => {
    const getUser = async () => {
      const user = await getUserInfo();
      setUser(user);
    };
    getUser();
  }, []);

  useEffect(() => {
    setIsSegmentDataLoading(true);
    fetchSegmentResponse(getFilteredColumns(selectedColumns));
  }, [selectedColumns]);

  useEffect(() => {
    if (
      (groups.length &&
        groups.every((group) => {
          return group.filters.every((filter) => filter.values.length);
        })) ||
      refreshOnDelete
    ) {
      if (refreshOnDelete) setRefreshOnDelete(false);
      setIsSegmentDataLoading(true);
      fetchSegmentResponse(getFilteredColumns(selectedColumns));
    }
  }, [groups]);

  useEffect(() => {
    const fetchEventProperties = async () => {
      const data = await getEventProperties(dsId as string);
      setEventProperties(data);
      setLoadingEventProperties(false);
    };
    setLoadingEventProperties(true);
    fetchEventProperties();
  }, []);

  return (
    <Box>
      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        bg={'black.50'}
        py={'2'}
        px={'4'}
      >
        <Flex alignItems={'center'} gap={'1'}>
          <Box color={'white.DEFAULT'} cursor={'pointer'}>
            <i className="ri-arrow-left-line"></i>
          </Box>
          <Text
            fontSize={'sh-20'}
            lineHeight={'sh-20'}
            fontWeight={'600'}
            color={'white.DEFAULT'}
          >
            New Segment
          </Text>
        </Flex>
        <Button
          px={'6'}
          py={'2'}
          fontSize={'base'}
          lineHeight={'base'}
          fontWeight={'600'}
          bg={'white.DEFAULT'}
          onClick={openSaveSegmentModal}
          _hover={{
            color: 'white.DEFAULT',
            bg: 'black.100',
          }}
        >
          Save Segment
        </Button>
      </Flex>
      <Box py={'7'} px={'10'}>
        <Flex justifyContent={'space-between'} alignItems={'center'}>
          <Text
            fontSize={'sh-18'}
            lineHeight={'sh-18'}
            fontWeight={'500'}
            data-testid={'segment-builder'}
          >
            Segment Builder
          </Text>
          <Text
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            data-testid={'clear-all'}
          >
            Clear all
          </Text>
        </Flex>
        <QueryBuilder
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventProperties}
          setGroups={setGroups}
          setRefreshOnDelete={setRefreshOnDelete}
        />
        <SegmentTable
          isSegmentDataLoading={isSegmentDataLoading}
          eventProperties={eventProperties}
          selectedColumns={selectedColumns}
          setSelectedColumns={setSelectedColumns}
          userTableData={userTableData}
        />
      </Box>
      <SaveSegmentModal
        isOpen={isSaveSegmentModalOpen}
        onClose={closeSaveSegmentModal}
        groups={groups}
        user={user}
      />
    </Box>
  );
};

export default CreateSegment;
