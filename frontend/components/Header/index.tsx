import { Box, useDisclosure } from '@chakra-ui/react';
import { useContext, useEffect, useState } from 'react';
import { AppertureContext } from '@lib/contexts/appertureContext';
import { AppWithIntegrations } from '@lib/domain/app';
import FiltersModal from '@components/FiltersModal';
import SwitchDataSource from '@components/SwitchDataSource';
import { DataSource } from '@lib/domain/datasource';
import { useRouter } from 'next/router';
import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';

type HeaderProps = {
  selectedApp: AppWithIntegrations;
  openAppsModal: Function;
};

const Header = ({ selectedApp, openAppsModal }: HeaderProps) => {
  const {
    isOpen: isfiltersModalOpen,
    onOpen: openFiltersModal,
    onClose: closeFiltersModal,
  } = useDisclosure();
  const {
    isOpen: isSwitchDataSourceModalOpen,
    onOpen: openSwitchDataSourceModal,
    onClose: closeSwitchDataSourceModal,
  } = useDisclosure();

  const context = useContext(AppertureContext);
  const router = useRouter();
  const { dsId } = router.query;

  const [dataSources, setDataSources] = useState(
    selectedApp?.integrations.flatMap(
      (integration) => integration.datasources as DataSource[]
    )
  );
  const [dataSourceType, setDataSourceType] = useState(
    dataSources.find((ds) => ds._id === dsId)?.provider
  );

  useEffect(() => {
    setDataSources(
      selectedApp?.integrations.flatMap(
        (integration) => integration.datasources as DataSource[]
      )
    );
  }, [selectedApp, dsId]);

  useEffect(() => {
    setDataSourceType(dataSources.find((ds) => ds._id === dsId)?.provider);
  }, [dataSources, dsId]);

  return (
    <Box>
      {context.device.isMobile ? (
        <MobileHeader
          openAppsModal={openAppsModal}
          dataSourceType={dataSourceType!!}
          openSwitchDataSourceModal={openSwitchDataSourceModal}
          selectedApp={selectedApp}
        />
      ) : (
        <DesktopHeader
          dataSourceType={dataSourceType!!}
          openSwitchDataSourceModal={openSwitchDataSourceModal}
          openFiltersModal={openFiltersModal}
        />
      )}
      <SwitchDataSource
        isOpen={isSwitchDataSourceModalOpen}
        onClose={closeSwitchDataSourceModal}
        dataSources={dataSources}
        selectedApp={selectedApp}
      />
      <FiltersModal isOpen={isfiltersModalOpen} onClose={closeFiltersModal} />
    </Box>
  );
};

export default Header;
