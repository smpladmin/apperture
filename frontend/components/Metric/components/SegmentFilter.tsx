import {
  Box,
  Button,
  Flex,
  RadioGroup,
  Text,
  Radio,
  Checkbox,
} from '@chakra-ui/react';
import Card from '@components/Card';
import SearchableDropdown from '@components/SearchableDropdown/SearchableDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getSavedSegmentsForDatasourceId } from '@lib/services/segmentService';
import { GREY_600 } from '@theme/index';
import { useRouter } from 'next/router';
import { Check, UsersFour } from 'phosphor-react';
import React, { useEffect, useRef, useState } from 'react';

const userOptions = [
  { label: 'Include Users', value: 1 },
  { label: 'Exclude Users', value: 0 },
];

const SegmentFilter = () => {
  const [isSegmentListOpen, setIsSegmentListOpen] = useState(false);
  const [isSegmentListLoading, setIsSegmentListLoading] = useState(false);
  const [segmentsList, setSegmentsList] = useState([]);

  const router = useRouter();
  const { dsId } = router.query;

  const segmentFilterRef = useRef(null);
  useOnClickOutside(segmentFilterRef, () => setIsSegmentListOpen(false));

  useEffect(() => {
    const fetchSegments = async () => {
      const res = await getSavedSegmentsForDatasourceId(dsId as string);
      setSegmentsList(res);
      setIsSegmentListLoading(false);
    };

    setIsSegmentListLoading(true);
    fetchSegments();
  }, []);

  console.log('segments', segmentsList);
  return (
    <Flex direction={'column'} gap={'3'}>
      <Flex justifyContent={'space-between'} alignItems={'center'}>
        <Text
          fontSize={'xs-12'}
          lineHeight={'lh-135'}
          color={'grey.500'}
          px={'2'}
          py={'1'}
        >
          Filter
        </Text>
        {/* <Button
          h={5.5}
          minW={5.5}
          w={5.5}
          p={0}
          data-testid={'add-event-button'}
        //   onClick={addAggregate}
          cursor={'pointer'}
          variant={'secondary'}
        >
          <Plus size={14} color={BLACK_DEFAULT} weight={'bold'} />
        </Button> */}
      </Flex>

      <Card p={'3'} borderRadius={'8'}>
        <Flex gap={1} alignItems={'center'}>
          <UsersFour size={20} color={GREY_600} />

          <Box position={'relative'} ref={segmentFilterRef}>
            <Text
              p={1}
              fontSize={'xs-14'}
              lineHeight={'lh-130'}
              fontWeight={'500'}
              onClick={() => setIsSegmentListOpen(true)}
              cursor={'pointer'}
            >
              Include all users
            </Text>
            <SearchableDropdown
              isOpen={isSegmentListOpen}
              isLoading={isSegmentListLoading}
              data={segmentsList}
              width="76"
              searchKey={'name'}
            >
              {
                <>
                  <RadioGroup onChange={() => {}} value={1}>
                    <Flex gap={2}>
                      {userOptions.map((option) => {
                        const isSelected = true === Boolean(option.value);
                        return (
                          <Flex
                            padding={1}
                            gap={1}
                            alignItems={'center'}
                            borderWidth={'.6px'}
                            borderRadius={'4'}
                            borderColor={
                              isSelected ? 'black.DEFAULT' : 'grey.400'
                            }
                            background={
                              isSelected ? 'white.400' : 'white.DEFAULT'
                            }
                          >
                            {isSelected ? <Check size={12} /> : null}
                            <Text
                              fontSize={'xs-12'}
                              lineHeight={'lh-135'}
                              fontWeight={'400'}
                              color={isSelected ? 'black.DEFAULT' : 'grey.600'}
                            >
                              {option.label}
                            </Text>
                            <Radio value={option.value} hidden />
                          </Flex>
                        );
                      })}
                    </Flex>
                  </RadioGroup>
                  <Flex direction={'column'}>
                    <Flex
                      px={2}
                      py={3}
                      gap={3}
                      alignItems={'center'}
                      as={'label'}
                    >
                      <Checkbox colorScheme={'radioBlack'} />
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'lh-135'}
                        fontWeight={500}
                        color={'grey.900'}
                      >
                        All Segments
                      </Text>
                    </Flex>
                    {segmentsList.map((seg: any) => {
                      return (
                        <Flex
                          px={2}
                          py={3}
                          gap={3}
                          alignItems={'center'}
                          as={'label'}
                        >
                          <Checkbox colorScheme={'radioBlack'} />
                          <Text
                            fontSize={'xs-14'}
                            lineHeight={'lh-135'}
                            fontWeight={500}
                            color={'grey.900'}
                          >
                            {seg.name}
                          </Text>
                        </Flex>
                      );
                    })}
                  </Flex>
                </>
              }
            </SearchableDropdown>
          </Box>
        </Flex>
      </Card>
    </Flex>
  );
};

export default SegmentFilter;

{
  /* <Flex
padding={1}
gap={1}
alignItems={'center'}
borderWidth={'.6px'}
borderRadius={'4'}
borderColor={'black.DEFAULT'}
>
<Check size={12} />
<Text fontSize={'xs-12'} lineHeight={'lh-135'}>
  Includes Users
</Text>
<Radio value={1} hidden />
</Flex>
<Flex
padding={1}
gap={1}
alignItems={'center'}
borderWidth={'.6px'}
borderRadius={'4'}
borderColor={'black.DEFAULT'}
>
<Check size={12} />
<Text fontSize={'xs-12'} lineHeight={'lh-135'}>
  Excludes Users
</Text>
<Radio value={0} hidden />
</Flex> */
}
