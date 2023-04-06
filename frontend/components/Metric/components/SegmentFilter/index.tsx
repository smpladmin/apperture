import { Box, Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { getSavedSegmentsForDatasourceId } from '@lib/services/segmentService';
import { GREY_600 } from '@theme/index';
import { useRouter } from 'next/router';
import { UsersFour } from 'phosphor-react';
import React, { useEffect, useRef, useState } from 'react';
import SelectSegmentsDropdown from './SelectSegmentsDropdown';

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
            <SelectSegmentsDropdown
              isSegmentListOpen={isSegmentListOpen}
              isSegmentListLoading={isSegmentListLoading}
              segmentsList={segmentsList}
            />
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

{
  /* <Button
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
        </Button> */
}
