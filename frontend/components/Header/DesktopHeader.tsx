import {
  Box,
  Button,
  Flex,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Provider } from '@lib/domain/provider';
import 'remixicon/fonts/remixicon.css';
import filterIcon from '@assets/icons/filter-icon.svg';
import Search from './Search';
import Image from 'next/image';
import { getProviderLogo } from '@lib/utils/common';
import { BLACK, BLACK_RUSSIAN, WHITE_DEFAULT } from '@theme/index';
import { useRouter } from 'next/router';

type DesktopHeaderProps = {
  dataSourceType: Provider;
  openSwitchDataSourceModal: () => void;
  openFiltersModal: () => void;
};

const DesktopHeader = ({
  dataSourceType,
  openSwitchDataSourceModal,
}: DesktopHeaderProps) => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push({
      pathname: `/analytics/${path}/create/[dsId]`,
      query: { dsId: router.query.dsId },
    });
  };

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
          {/* <Box cursor={'not-allowed'}>
            <i className="ri-calendar-fill"></i>
          </Box>
          <Box cursor={'not-allowed'}>
            <Image src={filterIcon} alt="filter-icon" />
          </Box> */}
          <Box>
            <Menu>
              <MenuButton
                disabled={dataSourceType === Provider.GOOGLE}
                as={Button}
                bgColor={BLACK}
                color={WHITE_DEFAULT}
                _hover={{
                  backgroundColor: 'hover-grey',
                }}
                _active={{
                  backgroundColor: 'hover-grey',
                }}
                rightIcon={<ChevronDownIcon />}
              >
                Create
              </MenuButton>
              <MenuList>
                <MenuItem
                  onClick={() => navigateTo('metric')}
                  _hover={{
                    backgroundColor: 'white.100',
                  }}
                >
                  <Flex
                    justifyContent={'space-between'}
                    gap={'2'}
                    alignItems={'center'}
                  >
                    <i className={'ri-funds-box-line'} />
                    Metric
                  </Flex>
                </MenuItem>
                <MenuItem
                  onClick={() => navigateTo('funnel')}
                  _hover={{
                    backgroundColor: 'white.100',
                  }}
                >
                  <Flex
                    justifyContent={'space-between'}
                    gap={'2'}
                    alignItems={'center'}
                  >
                    <i className={'ri-filter-line'} />
                    Funnel
                  </Flex>
                </MenuItem>
                <MenuItem
                  onClick={() => navigateTo('segment')}
                  _hover={{
                    backgroundColor: 'white.100',
                  }}
                >
                  <Flex
                    justifyContent={'space-between'}
                    gap={'2'}
                    alignItems={'center'}
                  >
                    <i className={'ri-funds-box-line'} />
                    Segment
                  </Flex>
                </MenuItem>
              </MenuList>
            </Menu>
          </Box>
          <Box
            flexShrink={0}
            onClick={openSwitchDataSourceModal}
            cursor={'pointer'}
          >
            <Box h={'8'} w={'8'}>
              <Image src={getProviderLogo(dataSourceType)} alt="data-source" />
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

export default DesktopHeader;
