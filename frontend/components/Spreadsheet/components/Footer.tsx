import { Box, Flex, Radio, RadioGroup, Text } from '@chakra-ui/react';
import React from 'react';
import AddSheet from './AddSheet';
import { TransientSheetData } from '@lib/domain/workbook';

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
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                >
                  {sheet.name}
                </Text>
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
