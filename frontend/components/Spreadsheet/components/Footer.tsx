import { Box, Flex, Input, Radio, RadioGroup, Text } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import AddSheet from './AddSheet';
import { TransientSheetData } from '@lib/domain/workbook';
import cloneDeep from 'lodash/cloneDeep';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';

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
                maxW={'30'}
                alignItems={'center'}
                justifyContent={'center'}
                bg={isSelected ? 'grey.400' : 'white.500'}
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
