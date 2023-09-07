import {
  Box,
  Button,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Text,
  background,
} from '@chakra-ui/react';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { ChartSeries, SheetChartDetail } from '@lib/domain/workbook';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { Table } from '@phosphor-icons/react';
import {
  CaretDown,
  CaretLeft,
  ChartBar,
  ChartLine,
  ChartPie,
  DotsThreeVertical,
  GridFour,
  MagnifyingGlass,
} from 'phosphor-react';
import React, { ChangeEvent, useRef, useState } from 'react';

const ChartSidePanel = ({
  showChartPanel,
  hideChartPanel,
  data,
  updateChart,
}: {
  showChartPanel: (data: SheetChartDetail) => void;
  hideChartPanel: () => void;
  data: SheetChartDetail;
  updateChart: (timestamp: number, updatedChartData: SheetChartDetail) => void;
}) => {
  const [isXAxisDropDownOpen, setIsXAxisDropDownOpen] = useState(false);
  const XAxisDropDownRef = useRef(null);
  const chartTypeRef = useRef(null);
  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    if (!searchTerm) {
      //   setSearchData?.(data);
      return;
    }
    // const results = getSeacrchResult(data, e.target.value, {
    //   keys: searchKey ? [searchKey] : [],
    // });
    // setSearchData?.(results);
  };
  const updateXAxisValue = (item: ChartSeries) => {
    const oldXAxisValue = data.xAxis;
    const newSeries = [
      ...(data.series.filter((serial) => serial.name !== item.name) || []),
      ...oldXAxisValue,
    ];
    const newData = data;
    data.xAxis = [item];
    data.series = newSeries;
    updateChart(data.timestamp, newData);
    setIsXAxisDropDownOpen(false);
  };
  useOnClickOutside(XAxisDropDownRef, () => setIsXAxisDropDownOpen(false));
  if (!data) return <></>;
  return (
    <Flex className="chart-panel" direction={'column'} gap={6}>
      <Flex
        fontSize={'xs-16'}
        fontWeight={500}
        lineHeight={'130%'}
        alignItems={'center'}
        gap={'2'}
        borderBottom={'0.4px solid #bdbdbd'}
        px={5}
        pb={4}
      >
        <CaretLeft
          height={'20px'}
          onClick={() => hideChartPanel()}
          cursor={'pointer'}
        />
        Visualise
      </Flex>
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'135%'}
        flexDir={'column'}
        px={5}
        pt={2}
      >
        Chart type
        <Box ref={chartTypeRef} position="relative" w={'full'}>
          <Flex
            w={'100%'}
            color={'black.DEFAULT'}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={500}
            h={8}
            px={3}
            py={2}
            mt={2}
            // onClick={() => !isDisabled && setIsConversionWindowListOpen(true)}
            alignItems={'center'}
            gap={'2'}
            borderRadius={'4px'}
            border={'1px'}
            borderColor={'white.200'}
            cursor={'pointer'}
            justifyContent={'space-between'}
            bg="white"
          >
            <Flex
              w="full"
              bg="white"
              fontSize={'xs-12'}
              fontWeight={400}
              lineHeight={'135%'}
              gap={2}
              alignContent={'center'}
              alignItems={'center'}
              cursor={'pointer'}
            >
              <ChartBar fontSize={'14px'} />
              <Text w="full">Columns</Text>
            </Flex>
            <CaretDown />
          </Flex>
          <Dropdown
            isOpen={false}
            width="100%"
            style={{
              borderRadius: '4px',
              boxShadow: `0px 0px 4px 0px rgba(0, 0, 0, 0.12)`,
              top: '104%',
              padding: 0,
            }}
          >
            <Flex flexDir={'column'} gap={3} py={2}>
              <Flex
                w="full"
                bg="white"
                fontSize={'xs-12'}
                fontWeight={400}
                lineHeight={'135%'}
                gap={2}
                px={3}
                py={1}
                alignContent={'center'}
                alignItems={'center'}
                opacity={0.3}
                cursor={'not-allowed'}
              >
                <ChartLine fontSize={'14px'} />
                <Text w="full">Line</Text>
              </Flex>
              <Flex
                w="full"
                bg="white"
                fontSize={'xs-12'}
                fontWeight={400}
                lineHeight={'135%'}
                gap={2}
                px={3}
                py={1}
                alignContent={'center'}
                alignItems={'center'}
                _hover={{ background: '#f5f5f5' }}
                cursor={'pointer'}
              >
                <ChartBar fontSize={'14px'} />
                <Text w="full">Columns</Text>
              </Flex>
              <Flex
                w="full"
                bg="white"
                fontSize={'xs-12'}
                fontWeight={400}
                lineHeight={'135%'}
                gap={2}
                px={3}
                py={1}
                alignContent={'center'}
                alignItems={'center'}
                opacity={0.3}
                cursor={'not-allowed'}
              >
                <ChartPie fontSize={'14px'} />
                <Text w="full">Pie</Text>
              </Flex>
            </Flex>
          </Dropdown>
        </Box>
      </Flex>
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'135%'}
        flexDir={'column'}
        px={5}
        pt={2}
      >
        Data range
        <Box ref={chartTypeRef} position="relative" w={'full'}>
          <Flex
            w={'100%'}
            color={'grey.500'}
            fontSize={'xs-12'}
            lineHeight={'130%'}
            fontWeight={400}
            h={8}
            px={3}
            py={2}
            mt={2}
            // onClick={() => !isDisabled && setIsConversionWindowListOpen(true)}
            alignItems={'center'}
            gap={'2'}
            borderRadius={'4px'}
            border={'1px'}
            borderColor={'grey.400'}
            cursor={'not-allowed'}
            justifyContent={'space-between'}
            bg="white.400"
          >
            A1:Z1000
            <GridFour fontSize={'xs-14'} />
          </Flex>
        </Box>
      </Flex>
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'135%'}
        flexDir={'column'}
        px={5}
        pt={2}
      >
        X axis
        <Flex
          w={'100%'}
          color={'black.DEFAULT'}
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={500}
          h={8}
          px={3}
          py={2}
          mt={2}
          // onClick={() => !isDisabled && setIsConversionWindowListOpen(true)}
          alignItems={'center'}
          gap={'2'}
          borderRadius={'4px'}
          border={'1px'}
          borderColor={'white.200'}
          justifyContent={'space-between'}
          bg="white"
        >
          <Flex
            w="full"
            bg="white"
            fontSize={'xs-12'}
            fontWeight={400}
            lineHeight={'135%'}
            gap={2}
            alignContent={'center'}
            alignItems={'center'}
            onClick={() => {
              setIsXAxisDropDownOpen(true);
            }}
          >
            {data.xAxis.map((item) => (
              <Text w="full" key={item.name}>
                {item.name}
              </Text>
            ))}
          </Flex>
          <DotsThreeVertical fontSize={'xs-14'} cursor={'pointer'} />
        </Flex>
        {isXAxisDropDownOpen ? (
          <Box position={'relative'} ref={XAxisDropDownRef}>
            <Flex
              position={'absolute'}
              direction={'column'}
              gap={'3'}
              bg="white"
              mt={1}
              maxH={'240px'}
              overflowY={'auto'}
            >
              <InputGroup id="x-axis-dropdown">
                <InputLeftElement>
                  <MagnifyingGlass size={'18'} />
                </InputLeftElement>
                <Input
                  autoFocus
                  type="text"
                  h={'10'}
                  focusBorderColor="none"
                  onChange={handleSearch}
                  border={'none'}
                  placeholder={''}
                  _placeholder={{
                    fontSize: 'xs-14',
                    lineHeight: 'lh-135',
                    fontWeight: '400',
                    textColor: 'grey.600',
                  }}
                  data-testid={'dropdown-search-input'}
                  bg={'white.DEFAULT'}
                  borderBottom={'0.3px solid'}
                  borderRadius={0}
                />
              </InputGroup>
              <Flex flexDirection={'column'}>
                {data.series.map((item) => {
                  return (
                    <Flex
                      w="full"
                      onClick={(e) => {
                        e.stopPropagation();
                        updateXAxisValue(item);
                      }}
                    >
                      <Text
                        w="full"
                        as={'span'}
                        cursor={'pointer'}
                        fontSize={'xs-12'}
                        fontWeight={400}
                        lineHeight={'135%'}
                        key={item.name}
                        px={2}
                        py={1}
                        my={2}
                        _hover={{ background: '#f5f5f5' }}
                      >
                        {item.name}
                      </Text>
                    </Flex>
                  );
                })}
              </Flex>
            </Flex>
          </Box>
        ) : null}
      </Flex>
      <Flex
        justifyContent={'space-between'}
        fontSize={'xs-12'}
        fontWeight={500}
        lineHeight={'135%'}
        flexDir={'column'}
        px={5}
        pt={2}
      >
        Series
        {data.yAxis.map((series) => (
          <SeriesCard name={series.name} />
        ))}
        <Text
          fontSize={'xs-12'}
          fontWeight={500}
          lineHeight={'135%'}
          color={'gray.600'}
          mt={2}
        >
          + Add Series
        </Text>
      </Flex>
    </Flex>
  );
};

export default ChartSidePanel;

const SeriesCard = ({ color = 'blue.800', name = 'Search' }) => {
  return (
    <Flex
      w={'100%'}
      color={'black.DEFAULT'}
      fontSize={'xs-14'}
      lineHeight={'xs-14'}
      fontWeight={500}
      h={8}
      px={3}
      py={2}
      mt={2}
      // onClick={() => !isDisabled && setIsConversionWindowListOpen(true)}
      alignItems={'center'}
      gap={'2'}
      borderRadius={'4px'}
      border={'1px'}
      borderColor={'white.200'}
      justifyContent={'space-between'}
      bg="white"
    >
      <Flex p={'1px'} border="0.3px solid #dfdfdf">
        <Flex w={3} h={3} bg={color} borderRadius={1}></Flex>
      </Flex>
      <Flex
        w="full"
        bg="white"
        fontSize={'xs-12'}
        fontWeight={400}
        lineHeight={'135%'}
        gap={2}
        alignContent={'center'}
        alignItems={'center'}
      >
        <Text w="full">{name}</Text>
      </Flex>
      <DotsThreeVertical fontSize={'xs-14'} cursor={'pointer'} />
    </Flex>
  );
};
