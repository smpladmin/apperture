import { Box, Flex } from '@chakra-ui/react';
import { GREY_500 } from '@theme/index';
import { ArrowLeft, ArrowRight } from 'phosphor-react';
import React, { useState } from 'react';
import Connections from './Connections';
import ConnectorColumns from './ConnectorColumns';

const SidePanel = () => {
  const [isSidePanelCollapsed, setIsSidePanelCollapsed] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [connectorData, setConnectorData] = useState<any>({});
  return (
    <Box
      width={isSidePanelCollapsed ? '8' : '62'}
      minWidth={isSidePanelCollapsed ? '8' : '62'}
      h={'full'}
      background={'white.500'}
      pt={'4'}
      borderRightWidth={'0.4px'}
      borderColor={'grey.700'}
    >
      {!isSidePanelCollapsed ? (
        <Flex direction={'column'} px={'2'} overflow={'auto'}>
          {showColumns ? (
            <ConnectorColumns
              connectorData={connectorData}
              setShowColumns={setShowColumns}
            />
          ) : (
            <Connections
              setConnectorData={setConnectorData}
              setShowColumns={setShowColumns}
            />
          )}
        </Flex>
      ) : null}

      <Box
        position={'fixed'}
        bottom={'0'}
        h={'8'}
        borderTopWidth={'0.4px'}
        borderColor={'grey.700'}
        pr={'2'}
        width={'inherit'}
        zIndex={'99'}
        background={'white.500'}
        borderRightWidth={'0.4px'}
      >
        <Flex
          cursor={'pointer'}
          h={'full'}
          justifyContent={'flex-end'}
          alignItems={'center'}
        >
          {isSidePanelCollapsed ? (
            <ArrowRight
              color={GREY_500}
              onClick={() => setIsSidePanelCollapsed((prevState) => !prevState)}
            />
          ) : (
            <ArrowLeft
              color={GREY_500}
              onClick={() => setIsSidePanelCollapsed((prevState) => !prevState)}
            />
          )}
        </Flex>
      </Box>
    </Box>
  );
};

export default SidePanel;
