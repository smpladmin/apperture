import {
  Box,
  Editable,
  EditableInput,
  EditablePreview,
  Flex,
  Radio,
  RadioGroup,
  Text,
} from '@chakra-ui/react';
import React from 'react';
import AddSheet from './AddSheet';
import { TransientSheetData } from '@lib/domain/workbook';
import cloneDeep from 'lodash/cloneDeep';

type FooterProps = {
  openQueryModal: Function;
  sheetsData: TransientSheetData[];
  setSheetsData: Function;
  selectedSheetIndex: number;
  setSelectedSheetIndex: Function;
};

const Footer = ({
  openQueryModal,
  sheetsData,
  setSheetsData,
  selectedSheetIndex,
  setSelectedSheetIndex,
}: FooterProps) => {
  const updateSheetName = (updatedSheetName: string, index: number) => {
    const toUpdateSheets = cloneDeep(sheetsData);
    toUpdateSheets[index].name = updatedSheetName;
    setSheetsData(toUpdateSheets);
  };

  return (
    <Flex
      position={'sticky'}
      bottom={'0'}
      bg={'white.500'}
      zIndex={'99'}
      h={'10'}
      borderTopWidth={'0.4px'}
      borderColor={'grey.700'}
    >
      <Box borderRightWidth={'0.4px'} borderColor={'grey.700'} w={'5'}></Box>
      <RadioGroup
        value={selectedSheetIndex}
        onChange={(value: string) => {
          setSelectedSheetIndex(+value);
        }}
      >
        <Flex h={'full'}>
          {sheetsData.map((sheet, index) => {
            const isSelected = selectedSheetIndex === index;
            return (
              <Flex
                key={index}
                p={'2'}
                borderRightWidth={'0.4px'}
                borderColor={'grey.700'}
                maxW={'20'}
                alignItems={'center'}
                justifyContent={'center'}
                bg={isSelected ? 'grey.700' : 'white.400'}
                cursor={'pointer'}
                as={'label'}
                data-testid={'sheet-name'}
              >
                <Editable
                  onChange={(nextValue) => updateSheetName(nextValue, index)}
                  defaultValue={sheet.name}
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                  color={'black.DEFAULT'}
                >
                  <EditablePreview
                    cursor={'pointer'}
                    p={'2'}
                    _hover={{ bg: 'white.200' }}
                    borderRadius={'4'}
                  />
                  <EditableInput
                    border={'1px'}
                    borderColor={'grey.400'}
                    borderRadius={'4'}
                    bg={'white.DEFAULT'}
                    p={'2'}
                    data-testid={'entity-name'}
                  />
                </Editable>
                <Radio hidden value={index} />
              </Flex>
            );
          })}
        </Flex>
      </RadioGroup>
      <AddSheet
        sheetsLength={sheetsData.length}
        openQueryModal={openQueryModal}
        setSheetsData={setSheetsData}
        setSelectedSheetIndex={setSelectedSheetIndex}
      />
    </Flex>
  );
};

export default Footer;
