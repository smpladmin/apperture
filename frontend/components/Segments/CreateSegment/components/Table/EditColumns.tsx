import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Button,
  Flex,
  Checkbox,
  CheckboxGroup,
  Text,
} from '@chakra-ui/react';
import LoadingSpinner from '@components/LoadingSpinner';
import 'remixicon/fonts/remixicon.css';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';

const EditColumns = ({ setSelectedColumns }) => {
  const [isFilterValuesListOpen, setIsFilterValuesListOpen] = useState(true);
  const [filterValues, setFilterValues] = useState([]);
  const [allValuesSelected, setAllValuesSelected] = useState(false);
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);
  const [eventPropertiesValues, setEventPropertiesValues] = useState([]);

  const eventValueRef = useRef(null);
  useOnClickOutside(eventValueRef, () => setIsFilterValuesListOpen(false));

  useEffect(() => {
    // check 'Select all' checkbox if all the options are selected
    if (
      filterValues.length === eventPropertiesValues.length &&
      !setLoadingPropertyValues
    ) {
      setAllValuesSelected(true);
    }
  }, [filterValues, eventPropertiesValues]);

  const handleSelectValues = () => {
    setIsFilterValuesListOpen(false);

    const updatedFilters = [...filters];
    updatedFilters[index]['values'] = filterValues;
    setFilters(updatedFilters);
  };

  const handleAllSelect = (e: any) => {
    const checked = e.target.checked;
    if (checked) {
      setAllValuesSelected(true);
      setFilterValues(eventPropertiesValues.map((property) => property[0]));
    } else {
      setAllValuesSelected(false);
      setFilterValues([]);
    }
  };

  const getValuesText = (values: any[]) => {
    if (!values.length) return 'Select value...';
    if (values.length <= 2) return values.join(', ');
    return `${values[0]}, ${values[1]} or ${values.length - 2} more`;
  };
  return (
    <>
      <Box position={'relative'} ref={eventValueRef}>
        <Button
          onClick={() => setIsFilterValuesListOpen(true)}
          bg={'none'}
          fontSize={'sh-14'}
          fontWeight={500}
          gap={2}
        >
          <i className="ri-pencil-fill"></i>
          Edit Columns
        </Button>

        {isFilterValuesListOpen ? (
          <Box
            position={'absolute'}
            zIndex={1}
            px={'3'}
            py={'3'}
            borderRadius={'12'}
            borderWidth={'0.4px'}
            borderColor={'grey.100'}
            bg={'white.DEFAULT'}
            shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
            maxH={'100'}
            overflowY={'auto'}
            right={'0'}
          >
            {loadingPropertyValues ? (
              <Flex
                w={'80'}
                h={'80'}
                alignItems={'center'}
                justifyContent={'center'}
              >
                <LoadingSpinner />
              </Flex>
            ) : (
              <Flex direction={'column'} minW={'80'} gap={'3'}>
                <Box overflowY={'auto'} maxHeight={'82'}>
                  <Checkbox
                    colorScheme={'radioBlack'}
                    px={'2'}
                    py={'3'}
                    isChecked={allValuesSelected}
                    onChange={handleAllSelect}
                  >
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'medium'}
                      cursor={'pointer'}
                    >
                      {'Select all'}
                    </Text>
                  </Checkbox>
                  <CheckboxGroup
                    value={filterValues}
                    onChange={(values) => {
                      setAllValuesSelected(false);
                      setFilterValues(values);
                    }}
                  >
                    {eventPropertiesValues.map((value) => {
                      return (
                        <Flex
                          as={'label'}
                          gap={'3'}
                          px={'2'}
                          py={'3'}
                          key={value[0]}
                          _hover={{
                            bg: 'white.100',
                          }}
                        >
                          <Checkbox colorScheme={'radioBlack'} value={value[0]}>
                            <Text
                              fontSize={'xs-14'}
                              lineHeight={'xs-14'}
                              fontWeight={'medium'}
                              cursor={'pointer'}
                            >
                              {value[0] || '(empty string)'}
                            </Text>
                          </Checkbox>
                        </Flex>
                      );
                    })}
                  </CheckboxGroup>
                </Box>
                <Button
                  w="full"
                  bg={'black.100'}
                  color={'white.DEFAULT'}
                  variant={'primary'}
                  onClick={handleSelectValues}
                >
                  Add
                </Button>
              </Flex>
            )}
          </Box>
        ) : null}
      </Box>
    </>
  );
};
export default EditColumns;
