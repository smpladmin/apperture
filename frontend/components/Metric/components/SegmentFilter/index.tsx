import { Box, Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { GREY_600 } from '@theme/index';
import { UsersFour } from 'phosphor-react';
import React, { useRef, useState } from 'react';
import SelectSegmentsDropdown from './SelectSegmentsDropdown';
import AddFilterComponent from '@components/StepFilters/AddFilter';
import { MetricSegmentFilter } from '@lib/domain/metric';
import StepFilter from '@components/StepFilters/StepFilters';
import { FilterType } from '@lib/domain/common';
import {
  SegmentFilterConditions,
  SegmentFilterDataType,
  SegmentFilterOperatorsString,
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

  const segmentFilterRef = useRef(null);
  useOnClickOutside(segmentFilterRef, () => setIsSegmentListOpen(false));

  const customFilters = segmentFilter.custom.filters as WhereSegmentFilter[];

  const handleAddFilter = (value: string) => {
    const getFilterCondition = (filters: WhereSegmentFilter[]) => {
      return !filters.length
        ? SegmentFilterConditions.WHERE
        : SegmentFilterConditions.AND;
    };

    const newFilter: WhereSegmentFilter = {
      condition: getFilterCondition(customFilters),
      operand: value,
      operator: SegmentFilterOperatorsString.IS,
      values: [],
      type: FilterType.WHERE,
      all: false,
      datatype: SegmentFilterDataType.STRING,
    };

    const tempFilters = cloneDeep(segmentFilters);
    tempFilters[index].custom.filters.push(newFilter);
    updateSegmentFilter(tempFilters);
  };

  const handleSetFilterValue = (filterIndex: number, values: string[]) => {
    let stepFilters = [...customFilters];
    stepFilters[filterIndex]['values'] = values;

    const tempFilters = cloneDeep(segmentFilters);
    tempFilters[index].custom.filters = stepFilters;
    updateSegmentFilter(tempFilters);
  };

  const handleSetFilterProperty = (filterIndex: number, property: string) => {
    let stepFilters = [...customFilters];
    stepFilters[filterIndex]['operand'] = property;

    const tempFilters = cloneDeep(segmentFilters);
    tempFilters[index].custom.filters = stepFilters;
    updateSegmentFilter(tempFilters);
  };

  const handleRemoveFilter = (filterIndex: number) => {
    let stepFilters = [...customFilters];
    stepFilters.splice(filterIndex, 1);

    if (filterIndex === 0 && stepFilters.length)
      stepFilters[0]['condition'] = SegmentFilterConditions.WHERE;

    const tempFilters = cloneDeep(segmentFilters);
    tempFilters[index].custom.filters = stepFilters;
    updateSegmentFilter(tempFilters);
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
        <Flex direction={'column'} w={'full'}>
          <Flex gap={1} alignItems={'center'}>
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

          {Boolean(customFilters.length) && (
            <Flex direction={'column'} gap={'2'} mt={'2'}>
              {customFilters.map((filter, index) => {
                return (
                  <StepFilter
                    key={index}
                    index={index}
                    filter={filter}
                    eventProperties={eventProperties}
                    loadingEventProperties={loadingEventProperties}
                    handleSetFilterProperty={handleSetFilterProperty}
                    handleSetFilterValue={handleSetFilterValue}
                    handleRemoveFilter={handleRemoveFilter}
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
