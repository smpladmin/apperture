import { Button, Flex, Input, Radio, RadioGroup, Text } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import {
  SheetType,
  SubHeaderColumnType,
  TransientSheetData,
} from '@lib/domain/workbook';
import cloneDeep from 'lodash/cloneDeep';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { Plus } from 'phosphor-react';
import { getSubheaders } from '../util';

type FooterProps = {
  openSelectSheetOverlay: Function;
  sheetsData: TransientSheetData[];
  setSheetsData: Function;
  selectedSheetIndex: number;
  setSelectedSheetIndex: Function;
  setShowColumns: Function;
  setShowEditor: Function;
  hideChartPanel: Function;
};

const Footer = ({
  openSelectSheetOverlay,
  sheetsData,
  setSheetsData,
  selectedSheetIndex,
  setSelectedSheetIndex,
  setShowColumns,
  setShowEditor,
  hideChartPanel,
}: FooterProps) => {
  const updateSheetName = (updatedSheetName: string, index: number) => {
    const toUpdateSheets = cloneDeep(sheetsData);
    toUpdateSheets[index].name = updatedSheetName;
    setSheetsData(toUpdateSheets);
  };

  const handleAddNewSheet = () => {
    const sheetsLength = sheetsData.length;
    const newSheet = {
      name: `Sheet ${sheetsLength + 1}`,
      query: '',
      data: [],
      headers: [],
      subHeaders: getSubheaders(SheetType.SIMPLE_SHEET),
      is_sql: true,
      sheet_type: SheetType.SIMPLE_SHEET,
      edit_mode: false,
      meta: {
        dsId: '',
        selectedColumns: [],
      },
      aiQuery: undefined,
      columnFormat: {},
    };

    setSheetsData((prevSheetData: TransientSheetData[]) => [
      ...prevSheetData,
      newSheet,
    ]);
    setSelectedSheetIndex(sheetsLength);
    setShowColumns(false);
    setShowEditor(false);
    openSelectSheetOverlay();
    hideChartPanel();
  };

  return (
    <Flex
      position={'fixed'}
      width={'full'}
      bottom={'0'}
      bg={'white.500'}
      zIndex={'1'}
      h={'8'}
      borderTopWidth={'0.4px'}
      borderColor={'grey.700'}
    >
      <RadioGroup
        value={selectedSheetIndex}
        onChange={(value: string) => {
          setSelectedSheetIndex(+value);
          setShowColumns(false);
          setShowEditor(false);
          hideChartPanel();
        }}
      >
        <Flex h={'full'}>
          {sheetsData.map((sheet, index) => {
            const isSelected = selectedSheetIndex === index;
            return (
              <Flex
                key={index}
                py={'2'}
                px={'3'}
                borderRightWidth={'0.4px'}
                borderColor={'grey.700'}
                maxW={'30'}
                alignItems={'center'}
                justifyContent={'center'}
                bg={isSelected ? 'blue.50' : 'white.500'}
                cursor={'pointer'}
                as={'label'}
                data-testid={'sheet-name'}
              >
                <RenameSheet
                  index={index}
                  sheet={sheet}
                  updateSheetName={updateSheetName}
                />
                <Radio hidden value={index} />
              </Flex>
            );
          })}
        </Flex>
      </RadioGroup>
      <Button
        pt={'2'}
        pb={'4'}
        px={'2'}
        data-testid={'add-sheet'}
        bg={'white.500'}
        borderRightWidth={'0.4px'}
        borderColor={'grey.700'}
        borderRadius={'0'}
        onClick={handleAddNewSheet}
      >
        <Plus size={16} weight="thin" />
      </Button>
    </Flex>
  );
};

export default Footer;

const RenameSheet = ({
  index,
  sheet,
  updateSheetName,
}: {
  index: number;
  sheet: TransientSheetData;
  updateSheetName: Function;
}) => {
  const [showInput, setShowInput] = useState(false);
  const [name, setName] = useState(sheet.name);
  const inputRef = useRef(null);

  const handleUpdateName = () => {
    setShowInput(false);
    updateSheetName(name, index);
  };

  useOnClickOutside(inputRef, handleUpdateName);
  return (
    <>
      {showInput ? (
        <Input
          autoFocus
          ref={inputRef}
          defaultValue={sheet.name}
          onChange={(e) => setName(e.target.value)}
          onBlur={handleUpdateName}
          onKeyDown={(e) => e.key === 'Enter' && handleUpdateName()}
          fontSize={'xs-12'}
          lineHeight={'xs-12'}
          fontWeight={'600'}
          px={'1'}
          py={'0'}
          h={'7'}
          borderRadius={'4'}
          focusBorderColor="grey.900"
          onFocus={(e) => e.target.select()}
          bg={'white.400'}
        />
      ) : (
        <Text
          fontSize={'xs-12'}
          lineHeight={'xs-12'}
          fontWeight={'400'}
          onDoubleClick={() => setShowInput(true)}
          maxW={'25'}
          textOverflow={'ellipsis'}
          overflow={'hidden'}
          whiteSpace={'nowrap'}
        >
          {sheet.name}
        </Text>
      )}
    </>
  );
};
