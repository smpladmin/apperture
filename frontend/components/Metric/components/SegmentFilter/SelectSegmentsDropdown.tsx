import {
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Radio,
  RadioGroup,
  Text,
} from '@chakra-ui/react';
import SearchableDropdown from '@components/SearchableDropdown/SearchableDropdown';
import { MetricSegmentFilter } from '@lib/domain/metric';
import { getSavedSegmentsForDatasourceId } from '@lib/services/segmentService';
import cloneDeep from 'lodash/cloneDeep';
import { useRouter } from 'next/router';
import { Check } from 'phosphor-react';
import React, { ChangeEvent, useEffect, useState } from 'react';

const userOptions = [
  { label: 'Include Users', value: 1 },
  { label: 'Exclude Users', value: 0 },
];

type SelectSegmentsDropdownProps = {
  index: number;
  isSegmentListOpen: boolean;
  setIsSegmentListOpen: Function;
  segmentFilter: MetricSegmentFilter;
  updateSegmentFilter: Function;
  segmentFilters: MetricSegmentFilter[];
};

const SelectSegmentsDropdown = ({
  index,
  isSegmentListOpen,
  setIsSegmentListOpen,
  segmentFilter,
  updateSegmentFilter,
  segmentFilters,
}: SelectSegmentsDropdownProps) => {
  const [segmentsList, setSegmentsList] = useState([]);
  const [isSegmentListLoading, setIsSegmentListLoading] = useState(false);

  const [areAllValuesSelected, setAreAllValuesSelected] = useState(false);
  const [includes, setIncludes] = useState<boolean>(segmentFilter.includes);

  const selectedSegmentFilterIds = segmentFilter.segments.map(
    (segment) => segment.id
  );
  const [selectedValues, setSelectedValues] = useState<string[]>(
    selectedSegmentFilterIds
  );

  const router = useRouter();
  const { dsId } = router.query;

  useEffect(() => {
    const fetchSegments = async () => {
      const res = await getSavedSegmentsForDatasourceId(dsId as string);
      setSegmentsList(res);
      setIsSegmentListLoading(false);
    };

    setIsSegmentListLoading(true);
    fetchSegments();
  }, []);

  useEffect(() => {
    // check 'Select all' checkbox if all the options are selected
    if (
      selectedValues.length === segmentsList.length &&
      !isSegmentListLoading
    ) {
      setAreAllValuesSelected(true);
    } else {
      setAreAllValuesSelected(false);
    }
  }, [selectedValues, segmentsList]);

  const handleAllSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setAreAllValuesSelected(true);
      setSelectedValues(segmentsList.map((seg: any) => seg._id));
    } else {
      setAreAllValuesSelected(false);
      setSelectedValues([]);
    }
  };

  const handleOnSubmit = () => {
    const seletedSegments = segmentsList
      .filter((segment: any) => selectedValues.includes(segment._id))
      .map((segment: any) => {
        return {
          id: segment._id,
          name: segment.name,
          groups: segment.groups,
        };
      });

    const tempSegmentFilters = cloneDeep(segmentFilters);
    tempSegmentFilters[index].includes = includes;
    tempSegmentFilters[index].segments = seletedSegments;
    updateSegmentFilter(tempSegmentFilters);

    setIsSegmentListOpen(false);
  };

  return (
    <SearchableDropdown
      isOpen={isSegmentListOpen}
      isLoading={isSegmentListLoading}
      data={segmentsList}
      width="76"
      searchKey={'name'}
    >
      {
        <>
          <RadioGroup
            value={+includes}
            onChange={(value) => {
              setIncludes(Boolean(+value));
            }}
          >
            <Flex gap={2}>
              {userOptions.map((option) => {
                const isSelected = includes === Boolean(option.value);

                return (
                  <Flex
                    as={'label'}
                    padding={1}
                    gap={1}
                    alignItems={'center'}
                    borderWidth={'0.6px'}
                    borderRadius={'4'}
                    borderColor={isSelected ? 'black.DEFAULT' : 'grey.400'}
                    background={isSelected ? 'white.400' : 'white.DEFAULT'}
                    cursor={'pointer'}
                    key={option.value}
                  >
                    {isSelected ? <Check size={12} /> : null}
                    <Text
                      fontSize={'xs-12'}
                      lineHeight={'lh-135'}
                      fontWeight={'400'}
                      color={isSelected ? 'black.DEFAULT' : 'grey.600'}
                    >
                      {option.label}
                    </Text>
                    <Radio value={option.value} hidden />
                  </Flex>
                );
              })}
            </Flex>
          </RadioGroup>
          <Flex
            direction={'column'}
            height={'full'}
            maxH={55}
            overflowY={'scroll'}
          >
            <Flex direction={'column'}>
              <Flex
                px={2}
                py={3}
                gap={3}
                alignItems={'center'}
                as={'label'}
                cursor={'pointer'}
                _hover={{
                  bg: 'white.100',
                }}
                borderRadius={'4'}
              >
                <Checkbox
                  colorScheme={'radioBlack'}
                  isChecked={areAllValuesSelected}
                  onChange={(e) => {
                    handleAllSelect(e);
                  }}
                />
                <Text
                  fontSize={'xs-14'}
                  lineHeight={'lh-135'}
                  fontWeight={500}
                  color={'grey.900'}
                >
                  All Segments
                </Text>
              </Flex>
              <CheckboxGroup
                value={selectedValues}
                onChange={(values: any) => {
                  setSelectedValues(values);
                }}
              >
                {segmentsList.map((segment: any) => {
                  return (
                    <Flex
                      key={segment._id}
                      px={2}
                      py={3}
                      gap={3}
                      alignItems={'center'}
                      as={'label'}
                      cursor={'pointer'}
                      _hover={{
                        bg: 'white.100',
                      }}
                      borderRadius={'4'}
                    >
                      <Checkbox
                        colorScheme={'radioBlack'}
                        value={segment._id}
                      />
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'lh-135'}
                        fontWeight={500}
                        color={'grey.900'}
                      >
                        {segment.name}
                      </Text>
                    </Flex>
                  );
                })}
              </CheckboxGroup>
            </Flex>
          </Flex>

          <Button
            colorScheme={'radioBlack'}
            fontSize={'xs-14'}
            lineHeight={'lh-130'}
            onClick={handleOnSubmit}
          >
            +Add
          </Button>
        </>
      }
    </SearchableDropdown>
  );
};

export default SelectSegmentsDropdown;
