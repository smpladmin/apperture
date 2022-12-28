import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  IconButton,
  Text,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react';
import {
  FilterItemType,
  Segment,
  SegmentGroup,
  SegmentGroupConditions,
  SegmentProperty,
  SegmentTableData,
} from '@lib/domain/segment';
import QueryBuilder from './components/QueryBuilder';
import SegmentTable from './components/Table/SegmentTable';
import {
  getEventProperties,
  getNodes,
  _getNodes,
} from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import { computeSegment } from '@lib/services/segmentService';
import { getFilteredColumns } from '../util';
import SaveSegmentModal from './components/SaveModal';
import { User } from '@lib/domain/user';
import { getUserInfo } from '@lib/services/userService';
import { cloneDeep, isEqual } from 'lodash';
import ExitConfirmationModal from './components/ExitConfirmationModal';

type CreateSegmentProp = {
  savedSegment?: Segment;
};

const CreateSegment = ({ savedSegment }: CreateSegmentProp) => {
  const [groups, setGroups] = useState<SegmentGroup[]>(
    savedSegment?.groups
      ? cloneDeep(savedSegment?.groups)
      : [
          {
            filters: [],
            conditions: [],
          },
        ]
  );
  const [groupConditions, setGroupConditions] = useState<
    SegmentGroupConditions[]
  >([]);
  const [isSaveDisabled, setIsSaveDisabled] = useState(false);
  const [eventProperties, setEventProperties] = useState<SegmentProperty[]>([]);
  const [loadingEventProperties, setLoadingEventProperties] = useState(false);
  const [selectedColumns, setSelectedColumns] = useState(
    savedSegment?.columns ? [...savedSegment?.columns] : ['user_id']
  );
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

  const {
    isOpen: isExitConfirmationModalOpen,
    onOpen: openExitConfirmModal,
    onClose: closeExitConfirmationModal,
  } = useDisclosure();

  const router = useRouter();
  const { dsId } = router.query;

  const fetchSegmentResponse = async (columns: string[]) => {
    const data = await computeSegment(
      dsId as string,
      groups,
      columns,
      groupConditions
    );
    setUserTableData(data);
    setIsSegmentDataLoading(false);
  };

  const showExitConfirmationModal = () => {
    if (!isSaveDisabled) {
      openExitConfirmModal();
    } else {
      router.push({
        pathname: '/analytics/saved',
      });
    }
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
    // Enable save segment button when the groups have same value but columns have changed.
    if (isSaveDisabled && savedSegment?.columns) {
      const check = isEqual(savedSegment.columns, selectedColumns);
      setIsSaveDisabled(check);
    }
  }, [selectedColumns]);

  useEffect(() => {
    const validGroupQuery = groups.some(
      (group) =>
        group.filters.length &&
        group.filters.every((filter) => filter.values.length)
    );
    if (validGroupQuery || refreshOnDelete) {
      if (refreshOnDelete) setRefreshOnDelete(false);
      setIsSegmentDataLoading(true);
      fetchSegmentResponse(getFilteredColumns(selectedColumns));
    }
    if (savedSegment?.groups) {
      //Disable save buttons if the group queries are not changed or the query is invalid
      const check = Boolean(
        isEqual(savedSegment.groups, groups) || !validGroupQuery
      );

      setIsSaveDisabled(check);
    }
  }, [groups, groupConditions]);

  useEffect(() => {
    const fetchEventProperties = async () => {
      const [eventProperties, events] = await Promise.all([
        getEventProperties(dsId as string),
        getNodes(dsId as string),
      ]);

      const transformedEventProperties = eventProperties.map(
        (eventProperty) => {
          return {
            id: eventProperty,
            type: FilterItemType.PROPERTY,
          };
        }
      );

      const transformedEvents = events.map((event) => {
        return {
          id: event.id,
          type: FilterItemType.EVENT,
        };
      });

      setEventProperties([...transformedEventProperties, ...transformedEvents]);
      setLoadingEventProperties(false);
    };
    setLoadingEventProperties(true);
    fetchEventProperties();
  }, []);

  const handleClearGroups = () => {
    setRefreshOnDelete(true);
    setGroups([
      {
        filters: [],
        conditions: [],
      },
    ]);
    setGroupConditions([]);
  };

  const addNewGroup = () => {
    const newGroup = {
      filters: [],
      conditions: [],
    };
    const newGroupCondition = SegmentGroupConditions.AND;

    setGroups([...groups, newGroup]);
    setGroupConditions([...groupConditions, newGroupCondition]);
  };

  const handleGroupConditionsChange = (index: number) => {
    const updatedGroupConditions = [...groupConditions];
    if (updatedGroupConditions[index] === SegmentGroupConditions.AND) {
      updatedGroupConditions[index] = SegmentGroupConditions.OR;
    } else {
      updatedGroupConditions[index] = SegmentGroupConditions.AND;
    }
    setGroupConditions(updatedGroupConditions);
  };

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
          <Box
            color={'white.DEFAULT'}
            cursor={'pointer'}
            onClick={showExitConfirmationModal}
          >
            <i className="ri-arrow-left-line"></i>
          </Box>
          <Flex
            alignItems={'center'}
            alignContent={'center'}
            justifyContent={'center'}
            gap={'1'}
          >
            <Text
              fontSize={'sh-20'}
              lineHeight={'sh-20'}
              fontWeight={'600'}
              color={'white.DEFAULT'}
            >
              {savedSegment?.name || 'New Segment'}
            </Text>
            {savedSegment?.description ? (
              <Tooltip
                label={savedSegment?.description}
                placement={'bottom-start'}
                bg={'black.100'}
              >
                <IconButton
                  icon={<i className="ri-information-fill" />}
                  aria-label="description"
                  bg={'black.0'}
                  fontWeight={'500'}
                  color={'white.100'}
                  cursor={'pointer'}
                  _hover={{}}
                  _active={{}}
                  height={'auto'}
                  width={'max-content'}
                  p={0}
                  m={0}
                />
              </Tooltip>
            ) : null}
          </Flex>
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
          disabled={isSaveDisabled}
          data-testid={'open-save-segment-modal'}
        >
          Save Segment
        </Button>
      </Flex>
      <Box py={'7'} px={'10'}>
        <Flex justifyContent={'space-between'} alignItems={'center'} mb={'4'}>
          <Text
            fontSize={'sh-18'}
            lineHeight={'sh-18'}
            fontWeight={'500'}
            data-testid={'segment-builder'}
          >
            Segment Builder
          </Text>
          <Button
            bg={''}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'500'}
            data-testid={'clear-all'}
            cursor={'pointer'}
            _hover={{
              bg: 'white.100',
            }}
            onClick={handleClearGroups}
          >
            Clear all
          </Button>
        </Flex>
        {groups.map((group, index, groups) => {
          return (
            <Box key={index} data-testid={'segment-group'}>
              <QueryBuilder
                key={index}
                eventProperties={eventProperties}
                loadingEventProperties={loadingEventProperties}
                setGroups={setGroups}
                setRefreshOnDelete={setRefreshOnDelete}
                group={group}
                groups={groups}
                groupIndex={index}
              />
              {groupConditions[index] ? (
                <Flex
                  justifyContent={'center'}
                  my={
                    groupConditions[index] === SegmentGroupConditions.AND
                      ? '-3'
                      : '2'
                  }
                >
                  <Text
                    px={'2'}
                    py={'1'}
                    fontSize={'xs-14'}
                    lineHeight={'xs-14'}
                    fontWeight={'500'}
                    bg={'black.50'}
                    borderRadius={'4'}
                    color={'white.DEFAULT'}
                    onClick={() => {
                      handleGroupConditionsChange(index);
                    }}
                    h={'6'}
                    cursor={'pointer'}
                    data-testid={'group-condition'}
                  >
                    {groupConditions[index].toLocaleUpperCase()}
                  </Text>
                </Flex>
              ) : null}
            </Box>
          );
        })}
        <Button
          mt={'4'}
          bg={''}
          _hover={{ bg: 'white.100' }}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'500'}
          onClick={addNewGroup}
          data-testid={'add-group'}
        >
          {'+ Group'}
        </Button>
        <SegmentTable
          isSegmentDataLoading={isSegmentDataLoading}
          eventProperties={eventProperties.filter(
            (property) => property.type === FilterItemType.PROPERTY
          )}
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
        columns={selectedColumns}
      />
      <ExitConfirmationModal
        isOpen={isExitConfirmationModalOpen}
        onClose={closeExitConfirmationModal}
        openSaveSegmentModal={openSaveSegmentModal}
      />
    </Box>
  );
};

export default CreateSegment;
