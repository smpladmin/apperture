import { Box, Button, Flex, Text } from '@chakra-ui/react';
import React, { useEffect } from 'react';
import { serverFunctions } from '../../utils/serverFunctions';
import { ActiveCell } from '../lib/types';
import { getCurrentSheetActiveCell } from '../lib/util';

type ActiveCellCardProps = {
  activeCell: ActiveCell;
  setActiveCell: React.Dispatch<React.SetStateAction<ActiveCell>>;
  setShowEditor: React.Dispatch<React.SetStateAction<boolean>>;
};

const ActiveCellCard = ({
  activeCell,
  setActiveCell,
  setShowEditor,
}: ActiveCellCardProps) => {
  useEffect(() => {
    const fetchActiveCell = async () => {
      try {
        const { sheetName, activeCellRow, activeCellColumn } =
          await serverFunctions.getActiveCell();

        setActiveCell({
          sheetName,
          rowIndex: activeCellRow,
          columnIndex: activeCellColumn,
        });
      } catch (error) {
        console.error('Error fetching active cell data:', error);
      }
    };

    const interval = setInterval(fetchActiveCell, 100);

    return () => clearInterval(interval);
  }, []);

  const currentSheetActiveCell = getCurrentSheetActiveCell(
    activeCell.sheetName,
    activeCell.columnIndex,
    activeCell.rowIndex
  );

  return (
    <Box>
      <Flex
        py={'24px'}
        px={'12px'}
        direction={'column'}
        gap={'12px'}
        borderRadius={'6px'}
      >
        <Text fontSize={'12px'} fontWeight={'400'} lineHeight={'16px'}>
          Select where you want data to be inserted:
        </Text>
        <Box
          border={'0.4px solid #BDBDBD'}
          borderRadius={'6'}
          minH={'32px'}
          px={'12px'}
          py={'8px'}
          fontSize={'12px'}
          fontWeight={'500'}
          lineHeight={'16px'}
          color={'#3F73CC'}
        >
          {currentSheetActiveCell}
        </Box>
      </Flex>
      <Button
        position={'fixed'}
        bottom={'24px'}
        right={'12px'}
        bg={'#212121'}
        px={'16px'}
        py={'6px'}
        border={'0'}
        borderRadius={'8'}
        fontSize={'12px'}
        fontWeight={'500'}
        lineHeight={'16px'}
        color={'#fff'}
        textAlign={'center'}
        height={'28px'}
        onClick={() => setShowEditor(true)}
        _hover={{
          bg: '#212121',
        }}
        disabled={!activeCell}
      >
        Continue
      </Button>
    </Box>
  );
};

export default ActiveCellCard;
