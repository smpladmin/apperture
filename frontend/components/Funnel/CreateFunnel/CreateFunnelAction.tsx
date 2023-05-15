import { Box, Button, Flex, Text } from '@chakra-ui/react';
import EventFields from '../components/EventFields';
import { ConversionWindowObj, FunnelStep } from '@lib/domain/funnel';
import { CaretDown, Plus } from 'phosphor-react';
import ConversionCriteria from '../components/ConversionCriteria';
import { stepsSequence } from '../util';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { useEffect, useRef, useState } from 'react';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { BLACK_DEFAULT, GREY_500 } from '@theme/index';
import { ExternalSegmentFilter } from '@lib/domain/common';
import { getEventProperties } from '@lib/services/datasourceService';
import { useRouter } from 'next/router';
import SegmentFilter from '@components/Metric/components/SegmentFilter';

type CreateFunnelActionProps = {
  funnelSteps: FunnelStep[];
  setFunnelSteps: Function;
  setIsStepAdded: Function;
  conversionWindow: ConversionWindowObj;
  setConversionWindow: Function;
  randomSequence: boolean;
  setRandomSequence: Function;
  segmentFilters: ExternalSegmentFilter[];
  updateSegmentFilter: Function;
};

const CreateFunnelAction = ({
  funnelSteps,
  setFunnelSteps,
  setIsStepAdded,
  conversionWindow,
  setConversionWindow,
  randomSequence,
  setRandomSequence,
  segmentFilters,
  updateSegmentFilter,
}: CreateFunnelActionProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sequenceRef = useRef(null);
  const router = useRouter();
  const { dsId } = router.query;

  const [eventProperties, setEventProperties] = useState<string[]>([]);
  const [loadingEventProperties, setLoadingEventProperties] =
    useState<boolean>(false);

  const handleAddNewStep = () => {
    const newField = { event: '', filters: [] };
    setFunnelSteps([...funnelSteps, newField]);
    setIsStepAdded(true);
  };

  useOnClickOutside(sequenceRef, () => setIsDropdownOpen(false));

  useEffect(() => {
    const fetchEventProperties = async () => {
      const properties = await getEventProperties(dsId as string);
      setEventProperties(properties);
      setLoadingEventProperties(false);
    };

    setLoadingEventProperties(true);
    fetchEventProperties();
  }, []);

  return (
    <Flex direction={'column'} gap={'3'} w={'full'}>
      <Flex px={2} justifyContent={'space-between'} alignItems={'center'}>
        <Flex gap={2} alignItems={'center'}>
          <Text
            color={'grey.500'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            fontWeight={'400'}
          >
            Steps
          </Text>
          <Box position={'relative'} ref={sequenceRef}>
            <Flex
              alignItems={'center'}
              py={'1'}
              px={'3'}
              border={'1px'}
              borderColor={'white.200'}
              borderRadius={'100'}
              gap={'1'}
              onClick={() => {
                setIsDropdownOpen(true);
              }}
              cursor={'pointer'}
              bg={isDropdownOpen ? 'white.400' : 'white.DEFAULT'}
              _hover={{ bg: 'white.400' }}
            >
              <Text
                color={'grey.500'}
                fontSize={{ base: 'xs-10', md: 'xs-12' }}
                lineHeight={{ base: 'xs-10', md: 'xs-12' }}
                fontWeight={'400'}
              >
                {randomSequence ? 'Any order' : 'In sequence'}
              </Text>
              <CaretDown size={14} color={GREY_500} />
            </Flex>
            <Dropdown isOpen={isDropdownOpen} width={'76'}>
              {stepsSequence.map((seq) => {
                return (
                  <Flex direction={'column'} key={seq.label}>
                    <Flex
                      p={'2'}
                      _hover={{ bg: 'white.400' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRandomSequence(seq.value);
                        setIsDropdownOpen(false);
                      }}
                      borderRadius={'4'}
                    >
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'lh-135'}
                        fontWeight={'500'}
                      >
                        {seq.label}
                      </Text>
                    </Flex>
                  </Flex>
                );
              })}
            </Dropdown>
          </Box>
        </Flex>
        <Button
          h={5.5}
          minW={5.5}
          w={5.5}
          p={0}
          data-testid={'add-button'}
          onClick={handleAddNewStep}
          cursor={'pointer'}
          variant={'secondary'}
        >
          <Plus size={14} color={BLACK_DEFAULT} weight={'bold'} />
        </Button>
      </Flex>
      <EventFields
        funnelSteps={funnelSteps}
        setFunnelSteps={setFunnelSteps}
        randomSequence={randomSequence}
        eventProperties={eventProperties}
        loadingEventProperties={loadingEventProperties}
      />
      {segmentFilters.map((segmentFilter, index) => (
        <SegmentFilter
          key={index}
          index={index}
          segmentFilter={segmentFilter}
          updateSegmentFilter={updateSegmentFilter}
          segmentFilters={segmentFilters}
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventProperties}
        />
      ))}
      <ConversionCriteria
        conversionWindow={conversionWindow}
        setConversionWindow={setConversionWindow}
      />
    </Flex>
  );
};

export default CreateFunnelAction;
