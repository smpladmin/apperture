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
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getSavedSegmentsForDatasourceId } from '@lib/services/segmentService';
import { useRouter } from 'next/router';
import { Check } from 'phosphor-react';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';

const userOptions = [
  { label: 'Include Users', value: 1 },
  { label: 'Exclude Users', value: 0 },
];

const SelectSegmentsDropdown = ({
  isSegmentListOpen,
  isSegmentListLoading,
  segmentsList,
}: any) => {
  const [selectedValues, setSelectedValues] = useState([]);
  const [areAllValuesSelected, setAreAllValuesSelected] = useState(false);

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

  console.log('segment id', segmentsList);
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
          <RadioGroup onChange={() => {}} value={1}>
            <Flex gap={2}>
              {userOptions.map((option) => {
                const isSelected = true === Boolean(option.value);
                return (
                  <Flex
                    padding={1}
                    gap={1}
                    alignItems={'center'}
                    borderWidth={'.6px'}
                    borderRadius={'4'}
                    borderColor={isSelected ? 'black.DEFAULT' : 'grey.400'}
                    background={isSelected ? 'white.400' : 'white.DEFAULT'}
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
              <Flex px={2} py={3} gap={3} alignItems={'center'} as={'label'}>
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
                      px={2}
                      py={3}
                      gap={3}
                      alignItems={'center'}
                      as={'label'}
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
          >
            +Add
          </Button>
        </>
      }
    </SearchableDropdown>
  );
};

export default SelectSegmentsDropdown;
