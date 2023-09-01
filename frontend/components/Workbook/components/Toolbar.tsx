import { Box, Flex } from '@chakra-ui/react';
import { ChartPie, Percent, PlusCircle } from 'phosphor-react';
import React from 'react';
import PivotIcon from './PivotIcon';
import { Sigma } from '@phosphor-icons/react';
import Image from 'next/image';
import Zero from '@assets/icons/NumberCircleZero.svg';
import DoubleZero from '@assets/icons/NumberCircleDoubleZero.svg';
import { SheetType, TransientSheetData } from '@lib/domain/workbook';

const Toolbar = ({
  sheetsData,
  selectedSheetIndex,
  addNewPivotSheet,
}: {
  sheetsData: TransientSheetData[];
  selectedSheetIndex: number;
  addNewPivotSheet: () => void;
}) => {
  const disabledIconStyle = { color: '#bdbdbd', cursor: 'no-drop' };
  const sheet = sheetsData[selectedSheetIndex];

  return (
    <Flex
      background={'white.500'}
      height={9}
      borderRadius={'13px'}
      alignItems={'center'}
      gap={'3'}
      px={5}
      py={2}
      borderBottomWidth={'0.4px'}
      borderColor={'grey.700'}
    >
      <PlusCircle style={{ ...disabledIconStyle }} />
      <ChartPie
        style={{
          ...disabledIconStyle,
        }}
      />

      <PivotIcon
        addNewPivotSheet={addNewPivotSheet}
        range={sheet?.name || ''}
        enabled={
          sheetsData[selectedSheetIndex].sheet_type !== SheetType.PIVOT_TABLE
        }
      />
      <Sigma style={{ ...disabledIconStyle }} />
      <Flex
        w={'6'}
        h={'6'}
        borderRadius={'4'}
        _hover={{ backgroundColor: 'white.200', cursor: 'no-drop' }}
        justifyContent={'center'}
        alignItems={'center'}
      >
        <Percent />
      </Flex>
      <Box
        w={'6'}
        h={'6'}
        borderRadius={'4'}
        _hover={{ backgroundColor: 'white.200', cursor: 'no-drop' }}
      >
        <Image src={Zero} alt={'Zero'} />
      </Box>
      <Box
        w={'7'}
        h={'6'}
        pr={'1'}
        borderRadius={'4'}
        _hover={{ backgroundColor: 'white.200', cursor: 'no-drop' }}
      >
        <Image src={DoubleZero} alt={'Double Zero'} />
      </Box>
    </Flex>
  );
};

export default Toolbar;
