import { Box, Flex, Text } from '@chakra-ui/react';
import { X } from 'phosphor-react';
import React from 'react';
import SimpleSheet from '@assets/images/simple-sheet.svg';
import PivotSheet from '@assets/images/pivot-sheet.svg';
import Image from 'next/image';
import { TransientSheetData } from '@lib/domain/workbook';

const SelectSheet = ({
  sheetsData,
  setSheetsData,
  setSelectedSheetIndex,
  closeSelectSheetOverlay,
}: {
  sheetsData: TransientSheetData[];
  setSheetsData: Function;
  setSelectedSheetIndex: Function;
  closeSelectSheetOverlay: () => void;
}) => {
  const showCloseButton = sheetsData.length > 1;

  const handleCloseOverlay = () => {
    setSheetsData((prevSheetsData: TransientSheetData[]) => {
      const tempSheetsData = [...prevSheetsData];
      tempSheetsData.pop();
      return tempSheetsData;
    });
    setSelectedSheetIndex((prevIndex: number) => prevIndex - 1);
    closeSelectSheetOverlay();
  };
  return (
    <>
      <Box
        position={'fixed'}
        left={'35%'}
        zIndex={'100'}
        bg={'white.DEFAULT'}
        p={'6'}
        borderRadius={'16'}
        mt={'30'}
        width={'150'}
      >
        <Flex direction={'column'} gap={'5'}>
          <Flex justifyContent={'space-between'} alignItems={'center'}>
            <Text fontSize={'xs-16'} lineHeight={'xs-16'} fontWeight={'500'}>
              Select a type of sheet
            </Text>
            {showCloseButton ? (
              <X
                size={16}
                onClick={handleCloseOverlay}
                style={{ cursor: 'pointer' }}
              />
            ) : null}
          </Flex>
          <Flex gap={'4'}>
            <Flex
              direction={'column'}
              px={'6'}
              py={'7'}
              gap={'6'}
              border={'1px'}
              borderColor={'white.200'}
              borderRadius={'12'}
              _hover={{
                borderColor: 'grey.700',
                boxShadow:
                  '0px 0px 0px 0px rgba(0, 0, 0, 0.06), 0px 3px 7px 0px rgba(0, 0, 0, 0.06), -2px 13px 13px 0px rgba(0, 0, 0, 0.05), -4px 30px 18px 0px rgba(0, 0, 0, 0.03), -8px 52px 21px 0px rgba(0, 0, 0, 0.01), -12px 82px 23px 0px rgba(0, 0, 0, 0.00)',
              }}
              cursor={'pointer'}
              flex={'1 1 0'}
              onClick={closeSelectSheetOverlay}
            >
              <Image
                src={SimpleSheet}
                alt={'simple-sheet'}
                height={140}
                priority
              />
              <Box>
                <Text
                  textAlign={'center'}
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'500'}
                >
                  Simple Sheet
                </Text>
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                >
                  Import columns from tables and start analysis of your data
                </Text>
              </Box>
            </Flex>
            <Flex
              direction={'column'}
              px={'6'}
              py={'7'}
              gap={'6'}
              border={'1px'}
              borderColor={'white.200'}
              borderRadius={'12'}
              _hover={{
                borderColor: 'grey.700',
                boxShadow:
                  '0px 0px 0px 0px rgba(0, 0, 0, 0.06), 0px 3px 7px 0px rgba(0, 0, 0, 0.06), -2px 13px 13px 0px rgba(0, 0, 0, 0.05), -4px 30px 18px 0px rgba(0, 0, 0, 0.03), -8px 52px 21px 0px rgba(0, 0, 0, 0.01), -12px 82px 23px 0px rgba(0, 0, 0, 0.00)',
              }}
              cursor={'pointer'}
              flex={'1 1 0'}
              onClick={closeSelectSheetOverlay}
            >
              <Image
                src={PivotSheet}
                alt={'pivot-sheet'}
                height={140}
                priority
              />
              <Box>
                <Text
                  textAlign={'center'}
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'500'}
                >
                  Pivot Sheet
                </Text>
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'xs-12'}
                  fontWeight={'400'}
                >
                  Add dimensions and metrics to the sheet and start analysis of
                  your data
                </Text>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>
      <Flex
        position={'fixed'}
        onClick={(e) => e.stopPropagation()}
        opacity={0.1}
        background={'black.DEFAULT'}
        h={'full'}
        w={'full'}
        justifyContent={'center'}
        zIndex={'99'}
      />
    </>
  );
};

export default SelectSheet;
