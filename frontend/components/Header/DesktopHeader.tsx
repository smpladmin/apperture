import { Box, Flex, Image } from '@chakra-ui/react';
import { Provider } from '@lib/domain/provider';
import 'remixicon/fonts/remixicon.css';
import filterIcon from '@assets/icons/filter-icon.svg';
import mixPanel from '@assets/images/mixPanel-icon.png';
import gaLogo from '@assets/images/ga-logo-small.svg';
import Search from './Search';

type DesktopHeaderProps = {
  dataSourceType: Provider;
  openSwitchDataSourceModal: () => void;
  openFiltersModal: () => void;
};

const DesktopHeader = ({
  dataSourceType,
  openSwitchDataSourceModal,
}: DesktopHeaderProps) => {
  return (
    <Flex
      direction={'row'}
      h={'18'}
      w={'full'}
      gap={'4'}
      bg={'white.DEFAULT'}
      py={'3'}
      px={'7'}
      shadow={'xs'}
    >
      <Flex w={'full'} alignItems={'center'} justifyContent={'space-between'}>
        <Search dataSourceType={dataSourceType!!} />
        <Flex alignItems={'center'} justifyContent={'space-between'} gap={6}>
          <Box cursor={'not-allowed'}>
            <i className="ri-calendar-fill"></i>
          </Box>
          <Box cursor={'not-allowed'}>
            <Image src={filterIcon.src} alt="filter-icon" />
          </Box>
          <Box
            flexShrink={0}
            onClick={openSwitchDataSourceModal}
            cursor={'pointer'}
          >
            <Image
              h={'8'}
              w={'8'}
              src={
                dataSourceType === Provider.MIXPANEL ? mixPanel.src : gaLogo.src
              }
              alt="data-source"
            />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DesktopHeader;
