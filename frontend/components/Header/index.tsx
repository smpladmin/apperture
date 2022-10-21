import { useDisclosure } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { AppWithIntegrations } from '@lib/domain/app';
import FiltersModal from '@components/FiltersModal';
import SwitchDataSource from '@components/SwitchDataSource';
import { DataSource } from '@lib/domain/datasource';
import { useRouter } from 'next/router';
import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';
import Render from '@components/Render';

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
    <>
      <Render on="mobile">
        <MobileHeader
          openAppsModal={openAppsModal}
          dataSourceType={dataSourceType!!}
          openSwitchDataSourceModal={openSwitchDataSourceModal}
          selectedApp={selectedApp}
        />
      </Render>
      <Render on="desktop">
        <DesktopHeader
          dataSourceType={dataSourceType!!}
          openSwitchDataSourceModal={openSwitchDataSourceModal}
          openFiltersModal={openFiltersModal}
        />
      </Render>
      <SwitchDataSource
        isOpen={isSwitchDataSourceModalOpen}
        onClose={closeSwitchDataSourceModal}
        dataSources={dataSources}
        selectedApp={selectedApp}
      />
      <FiltersModal isOpen={isfiltersModalOpen} onClose={closeFiltersModal} />
    </>
  );
};

export default Header;
