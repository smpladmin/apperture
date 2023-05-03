import { Box, Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { GREY_500, GREY_600 } from '@theme/index';
import { Trash, UsersFour } from 'phosphor-react';
import React, { useEffect, useRef, useState } from 'react';
import SelectSegmentsDropdown from './SelectSegmentsDropdown';
import AddFilterComponent from '@components/StepFilters/components/AddFilter';
import { MetricSegmentFilter } from '@lib/domain/metric';
import StepFilter from '@components/StepFilters/StepFilters';
import {
  FilterDataType,
  FilterOperatorsString,
  FilterType,
  GroupConditions,
} from '@lib/domain/common';
import {
  SegmentFilterConditions,
  WhereSegmentFilter,
} from '@lib/domain/segment';
import cloneDeep from 'lodash/cloneDeep';
import { getSelectedSegmentsText } from '@components/Metric/util';

type SegmentFilterProps = {
  index: number;
  segmentFilter: MetricSegmentFilter;
  updateSegmentFilter: Function;
  loadingEventProperties: boolean;
  eventProperties: string[];
  segmentFilters: MetricSegmentFilter[];
};

const SegmentFilter = ({
  index,
  segmentFilter,
  updateSegmentFilter,
  loadingEventProperties,
  eventProperties,
  segmentFilters,
}: SegmentFilterProps) => {
  const [isSegmentListOpen, setIsSegmentListOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const segmentFilterRef = useRef(null);
  useOnClickOutside(segmentFilterRef, () => setIsSegmentListOpen(false));

  const [customFilters, setCustomFilters] = useState(
    (segmentFilter.custom.filters as WhereSegmentFilter[]) || []
  );

  const handleAddFilter = (value: string) => {
    const getFilterCondition = (filters: WhereSegmentFilter[]) => {
      return !filters.length
        ? SegmentFilterConditions.WHERE
        : SegmentFilterConditions.AND;
    };

    const newFilter: WhereSegmentFilter = {
      condition: getFilterCondition(customFilters),
      operand: value,
      operator: FilterOperatorsString.IS,
      values: [],
      type: FilterType.WHERE,
      all: false,
      datatype: FilterDataType.STRING,
    };

    setCustomFilters([...customFilters, newFilter]);
  };

  useEffect(() => {
    // update segment filter state
    const updatedSegmentFilters = cloneDeep(segmentFilters);
    updatedSegmentFilters[index].custom.filters = customFilters;
    updateSegmentFilter(updatedSegmentFilters);
  }, [customFilters]);

  const handleRemoveSegmentFilter = (index: number) => {
    updateSegmentFilter([
      {
        condition: GroupConditions.OR,
        includes: true,
        custom: {
          condition: GroupConditions.AND,
          filters: [],
        },
        segments: [],
      },
    ]);
  };

  return (
    <Flex direction={'column'} gap={'3'}>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text
          fontSize={'xs-12'}
          lineHeight={'lh-135'}
          color={'grey.500'}
          px={'2'}
          py={'1'}
        >
          Filter
        </Text>
      </Flex>

      <Card p={'3'} borderRadius={'8'} borderColor={'white.200'}>
        <Flex
          direction={'column'}
          w={'full'}
          onMouseEnter={() => {
            setIsHovered(true);
          }}
          onMouseLeave={() => {
            setIsHovered(false);
          }}
        >
          <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Flex gap={1} alignItems={'center'} w={'full'}>
              <UsersFour size={20} color={GREY_600} />

              <Box position={'relative'} ref={segmentFilterRef} w={'full'}>
                <Text
                  p={'1'}
                  fontSize={'xs-14'}
                  lineHeight={'lh-130'}
                  fontWeight={'500'}
                  onClick={() => setIsSegmentListOpen(true)}
                  cursor={'pointer'}
                  _hover={{
                    bg: 'white.400',
                  }}
                  borderRadius={'4'}
                  bg={isSegmentListOpen ? 'white.400' : ''}
                  data-testid={'segment-filter-text'}
                  maxWidth={'62'}
                  textOverflow={'ellipsis'}
                  overflow={'hidden'}
                  whiteSpace={'nowrap'}
                >
                  {getSelectedSegmentsText(
                    segmentFilter.includes,
                    segmentFilter.segments
                  )}
                </Text>

                <SelectSegmentsDropdown
                  index={index}
                  isSegmentListOpen={isSegmentListOpen}
                  setIsSegmentListOpen={setIsSegmentListOpen}
                  segmentFilter={segmentFilter}
                  updateSegmentFilter={updateSegmentFilter}
                  segmentFilters={segmentFilters}
                />
              </Box>
            </Flex>
            <Box
              data-testid={'remove-segment-filter'}
              fontWeight={'500'}
              color={'grey.200'}
              cursor={'pointer'}
              opacity={isHovered ? 1 : 0}
              onClick={() => handleRemoveSegmentFilter(index)}
              hidden={!segmentFilter.segments.length}
            >
              <Trash size={14} color={GREY_500} />
            </Box>
          </Flex>
          {Boolean(customFilters.length) && (
            <Flex direction={'column'} gap={'2'} mt={'2'}>
              {customFilters.map((filter, index) => {
                return (
                  <StepFilter
                    key={index}
                    index={index}
                    filter={filter}
                    filters={customFilters}
                    setFilters={setCustomFilters}
                    eventProperties={eventProperties}
                    loadingEventProperties={loadingEventProperties}
                  />
                );
              })}
            </Flex>
          )}

          <Flex ml={'-1'} mt={'2'}>
            <AddFilterComponent
              eventProperties={eventProperties}
              loadingEventProperties={loadingEventProperties}
              handleAddFilter={handleAddFilter}
              hideIndentIcon={true}
            />
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};

export default SegmentFilter;
