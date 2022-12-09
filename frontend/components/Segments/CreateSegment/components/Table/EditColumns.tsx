import React, { useState, useRef, useEffect, ChangeEvent } from 'react';
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

const EditColumns = ({
  eventProperties,
  setSelectedColumns,
  selectedColumns,
}: any) => {
  const [isColumnListOpen, setIsColumnListOpen] = useState(false);
  const [checkedValues, setCheckedValues] = useState<string[]>([
    ...selectedColumns,
  ]);
  const [allValuesSelected, setAllValuesSelected] = useState(false);
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);

  const eventValueRef = useRef(null);
  useOnClickOutside(eventValueRef, () => setIsColumnListOpen(false));

  const handleSelectValues = () => {
    setIsColumnListOpen(false);

    setSelectedColumns([...new Set(['user_id', ...checkedValues])]);
  };

  const handleAllSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setAllValuesSelected(true);
      setCheckedValues(eventProperties);
    } else {
      setAllValuesSelected(false);
      setCheckedValues([]);
    }
  };

  return (
    <>
      <Box position={'relative'} ref={eventValueRef}>
        <Button
          onClick={() => setIsColumnListOpen(true)}
          bg={'none'}
          fontSize={'sh-14'}
          fontWeight={500}
          gap={2}
        >
          <i className="ri-pencil-fill"></i>
          <Text fontSize={'xs-14'} fontWeight={500}>
            Edit Columns
          </Text>
        </Button>

        {isColumnListOpen ? (
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
                    value={checkedValues}
                    onChange={(values: string[]) => {
                      setAllValuesSelected(false);
                      setCheckedValues(values);
                    }}
                  >
                    {eventProperties.map((value: string) => {
                      return (
                        <Flex
                          as={'label'}
                          gap={'3'}
                          px={'2'}
                          py={'3'}
                          key={value}
                          _hover={{
                            bg: 'white.100',
                          }}
                        >
                          {value && (
                            <Checkbox colorScheme={'radioBlack'} value={value}>
                              <Text
                                fontSize={'xs-14'}
                                lineHeight={'xs-14'}
                                fontWeight={'medium'}
                                cursor={'pointer'}
                              >
                                {value}
                              </Text>
                            </Checkbox>
                          )}
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
