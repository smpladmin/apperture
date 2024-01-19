import { Flex } from '@chakra-ui/react';
import React, { useEffect, useState } from 'react';
import Connections from './Connections';
import ConnectorColumns from './ConnectorColumns';
import { Connection, ConnectionSource } from '@lib/domain/connections';
import { useRouter } from 'next/router';
import { getConnectionsForApp } from '@lib/services/connectionService';

const SidePanel = ({ savedDatamartDsId }: { savedDatamartDsId?: string }) => {
  const [loadingConnections, setLoadingConnections] = useState(false);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [connectorData, setConnectorData] = useState<
    ConnectionSource & { heirarchy: string[] }
  >({
    id: '',
    name: '',
    fields: [],
    datasource_id: '',
    table_name: '',
    database_name: '',
    heirarchy: [],
  });
  const [showColumns, setShowColumns] = useState(false);
  const router = useRouter();
  const { dsId } = router.query;
  const { selectedApp } = window?.localStorage;

  useEffect(() => {
    const fetchConnections = async () => {
      const res = await getConnectionsForApp(
        savedDatamartDsId || (dsId as string),
        selectedApp as string
      );
      setConnections(res);
      setLoadingConnections(false);
    };

    setLoadingConnections(true);
    fetchConnections();
  }, [dsId]);

  return (
    <Flex
      direction={'column'}
      px={'2'}
      pt={'4'}
      width={'73'}
      minWidth={'73'}
      overflow={'auto'}
      borderRight={'0.4px solid #BDBDBD'}
    >
      {showColumns ? (
        <ConnectorColumns
          connectorData={connectorData}
          setShowColumns={setShowColumns}
        />
      ) : (
        <Connections
          loadingConnections={loadingConnections}
          connections={connections}
          setShowColumns={setShowColumns}
          setConnectorData={setConnectorData}
        />
      )}
    </Flex>
  );
};

export default SidePanel;
