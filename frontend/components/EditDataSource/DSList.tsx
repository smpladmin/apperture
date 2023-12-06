import { Box, Flex, Text } from '@chakra-ui/react';
import { DataSource } from '@lib/domain/datasource';
import { Provider } from '@lib/domain/provider';
import React, { CSSProperties, useMemo, useRef, useState } from 'react';

import Image from 'next/image';
import gaLogo from '@assets/images/ga-logo-small.svg';
import mixpanelLogo from '@assets/images/mixPanel-icon.png';
import amplitudeLogo from '@assets/images/amplitude-icon.png';
import clevertapLogo from '@assets/images/clevertap-icon.png';
import branchLogo from '@assets/images/branch.png';
import appertureLogo from '@assets/images/apperture-logo-new-small.svg';
import apilogo from '@assets/images/apilogo.png';
import mysqlLogo from '@assets/images/mysql-icon.png';
import mssqlLogo from '@assets/images/mssql-icon.png';
import csvLogo from '@assets/images/csvicon.png';
import { useRouter } from 'next/router';
import { GREY_500, GREY_600 } from '@theme/index';
import {
  CalendarBlank,
  DotsThreeOutlineVertical,
  Table,
  Trash,
} from 'phosphor-react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { dateFormat } from '@lib/utils/common';
import dayjs from 'dayjs';
import { deleteDatasource } from '@lib/services/datasourceService';
const IconProvider = ({
  provider,
  style,
}: {
  provider: Provider;
  style: CSSProperties;
}) => {
  switch (provider) {
    case Provider.AMPLITUDE:
      return (
        <Image
          style={{ maxHeight: '32px' }}
          src={amplitudeLogo}
          alt="gaLogo"
          objectFit="cover"
        />
      );
    case Provider.GOOGLE:
      return (
        <Image style={style} src={gaLogo} alt="gaLogo" objectFit="cover" />
      );
    case Provider.AMPLITUDE:
      return (
        <Image
          style={style}
          src={amplitudeLogo}
          alt="gaLogo"
          objectFit="cover"
        />
      );
    case Provider.MIXPANEL:
      return (
        <Image
          style={style}
          src={mixpanelLogo}
          alt="gaLogo"
          objectFit="cover"
        />
      );
    case Provider.CLEVERTAP:
      return (
        <Image
          style={style}
          src={clevertapLogo}
          alt="gaLogo"
          objectFit="cover"
        />
      );
    case Provider.BRANCH:
      return (
        <Image style={style} src={branchLogo} alt="gaLogo" objectFit="cover" />
      );
    case Provider.APPERTURE:
      return (
        <Image
          style={style}
          src={appertureLogo}
          alt="gaLogo"
          objectFit="cover"
        />
      );
    case Provider.API:
      return (
        <Image style={style} src={apilogo} alt="gaLogo" objectFit="cover" />
      );
    case Provider.MYSQL:
      return (
        <Image style={style} src={mysqlLogo} alt="gaLogo" objectFit="cover" />
      );
    case Provider.MSSQL:
      return (
        <Image style={style} src={mssqlLogo} alt="gaLogo" objectFit="cover" />
      );
    case Provider.CSV:
      return (
        <Image style={style} src={csvLogo} alt="gaLogo" objectFit="cover" />
      );
    default:
      return (
        <Image
          style={style}
          src={appertureLogo}
          alt="gaLogo"
          objectFit="cover"
        />
      );
  }
};

function DSList({
  provider,
  datasources,
  setRefresh,
}: {
  provider: Provider;
  datasources: DataSource[];
  setRefresh: Function;
}) {
  const router = useRouter();

  const handleEditDatasource = (datasource: DataSource) => {
    router.push({
      pathname: `/analytics/app/[appId]/integration/[provider]/edit/[dsId]`,
      query: {
        appId: datasource.appId,
        provider: datasource.provider,
        dsId: datasource._id,
      },
    });
  };

  return (
    <Flex w="full" direction={'column'}>
      <Flex
        w="full"
        alignItems={'center'}
        gap={2}
        px={3}
        py={4}
        borderBottom={'1px solid #ededed'}
      >
        <Box h={'32px'} width={'32px'}>
          <IconProvider provider={provider} style={{ maxHeight: '100%' }} />
        </Box>
        <Text
          fontSize={'xs-14'}
          lineHeight={'18px'}
          fontWeight={500}
          textTransform={'capitalize'}
        >
          {provider}
        </Text>
      </Flex>
      {datasources.map((datasource) => {
        return (
          <Flex
            key={datasource._id}
            alignContent={'center'}
            justifyContent={'space-between'}
            py={3}
            ml={9}
            maxW={'100%'}
            borderBottom={'1px solid #ededed'}
            alignItems={'center'}
          >
            <Flex
              gap={2}
              cursor={
                [Provider.CSV, Provider.APPERTURE].includes(datasource.provider)
                  ? 'inherit'
                  : 'pointer'
              }
              onClick={() =>
                [Provider.CSV, Provider.APPERTURE].includes(datasource.provider)
                  ? null
                  : handleEditDatasource(datasource)
              }
            >
              <Table color={GREY_600} size={16} />
              <Text
                fontSize={'xs-12'}
                lineHeight={'16.2px'}
                fontWeight={'500'}
                color={'grey.800'}
              >
                {datasource.name ||
                  datasource.externalSourceId ||
                  datasource._id}
              </Text>
            </Flex>
            <Flex gap={2} justifyContent={'flex-end'} alignItems={'center'}>
              <Flex gap={2} alignItems={'center'}>
                <CalendarBlank color={GREY_600} size={16} />
                <Text
                  fontSize={'xs-12'}
                  lineHeight={'16.2px'}
                  fontWeight={'500'}
                  color={'grey.800'}
                  w={'200px'}
                >
                  {`${dayjs
                    .utc(datasource.updatedAt)
                    .local()
                    .format(dateFormat)}`}
                </Text>
                <DropdownMenu dsId={datasource._id} setRefresh={setRefresh} />
              </Flex>
            </Flex>
          </Flex>
        );
      })}
    </Flex>
  );
}

function DropdownMenu({
  dsId,
  setRefresh,
}: {
  dsId: string;
  setRefresh: Function;
}) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  useOnClickOutside(dropdownRef, () => setIsDropdownOpen(false));
  const handleDelete = async () => {
    await deleteDatasource(dsId);
    setRefresh(true);
  };
  return (
    <Box
      position={'relative'}
      ref={dropdownRef}
      w={'fit-content'}
      my={2}
      mx={3}
    >
      <DotsThreeOutlineVertical
        size={12}
        color={GREY_600}
        onClick={(e) => {
          e.stopPropagation();
          setIsDropdownOpen(true);
        }}
        weight="fill"
        cursor={'pointer'}
      />
      <Dropdown
        isOpen={isDropdownOpen}
        dropdownPosition={'right'}
        minWidth={'30'}
      >
        <Flex
          gap={'2'}
          alignItems={'center'}
          cursor={'pointer'}
          _hover={{ bg: 'white.100' }}
          p={'2'}
          borderRadius={'4'}
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          data-testid={'table-action-delete'}
        >
          <Trash size={16} color={GREY_500} />
          <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'400'}>
            Delete
          </Text>
        </Flex>
      </Dropdown>
    </Box>
  );
}

export default DSList;
