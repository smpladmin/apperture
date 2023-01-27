import { Box, Divider, Flex, IconButton, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AddFilter from './AddFilter';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import {
  FunnelFilterConditions,
  FunnelFilterDataType,
  FunnelFilterOperators,
  FunnelStep,
  FunnelStepFilter,
} from '@lib/domain/funnel';
import { MapContext } from '@lib/contexts/mapContext';
import FunnelStepFilterComponent from './FunnelStepFilters';
import { useRouter } from 'next/router';
import { getEventProperties } from '@lib/services/datasourceService';
import { cloneDeep } from 'lodash';
import { FilterType, SegmentProperty } from '@lib/domain/segment';
import { LOGAN } from '@theme/index';
import { Node } from '@lib/domain/node';

type FunnelComponentCardProps = {
  index: number;
  funnelStep: FunnelStep;
  funnelSteps: FunnelStep[];
  setFunnelSteps: Function;
};

const FunnelComponentCard = ({
  index,
  funnelStep,
  funnelSteps,
  setFunnelSteps,
}: FunnelComponentCardProps) => {
  const {
    state: { nodes },
  } = useContext(MapContext);

  const eventBoxRef = useRef(null);
  const router = useRouter();
  const { dsId } = router.query;

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isEventListOpen, setIsEventListOpen] = useState<boolean>(false);
  const [eventsList, setEventsList] = useState<Array<Node>>([]);
  const [eventProperties, setEventProperties] = useState<string[]>([]);
  const [loadingEventProperties, setLoadingEventProperties] =
    useState<boolean>(false);
  const [showCrossIcon, setShowCrossIcon] = useState(false);

  useOnClickOutside(eventBoxRef, () => {
    setIsEventListOpen(false);
  });

  useEffect(() => {
    setEventsList(nodes);
  }, [nodes]);

  useEffect(() => {
    if (funnelSteps.length <= 2) setShowCrossIcon(false);
    else setShowCrossIcon(true);
  }, [funnelSteps]);

  useEffect(() => {
    const fetchEventProperties = async () => {
      const properties = await getEventProperties(dsId as string);
      setEventProperties(properties);
      setLoadingEventProperties(false);
    };

    setLoadingEventProperties(true);
    fetchEventProperties();
  }, []);

  const handleEventSelection = (selection: Node) => {
    setIsEventListOpen(false);
    const tempFunnelSteps = cloneDeep(funnelSteps);
    tempFunnelSteps[index]['event'] = selection.id;
    setFunnelSteps(tempFunnelSteps);
  };

  const handleRemoveFunnelStep = (index: number) => {
    if (funnelSteps.length <= 2) return;
    let tempFunnelSteps = [...funnelSteps];
    tempFunnelSteps.splice(index, 1);
    setFunnelSteps(tempFunnelSteps);
  };

  const updateStepFilters = useCallback(
    (stepFilters: FunnelStepFilter[]) => {
      const tempFunnelSteps = cloneDeep(funnelSteps);
      tempFunnelSteps[index]['filters'] = stepFilters;
      setFunnelSteps(tempFunnelSteps);
    },
    [funnelSteps]
  );

  const handleAddFilter = (value: string) => {
    const getFunnelFilterCondition = (stepFilters: FunnelStepFilter[]) => {
      return !stepFilters.length
        ? FunnelFilterConditions.WHERE
        : FunnelFilterConditions.AND;
    };

    const stepFilters = [...funnelStep.filters];
    stepFilters.push({
      condition: getFunnelFilterCondition(stepFilters),
      operand: value,
      operator: FunnelFilterOperators.IS,
      values: [],
      type: FilterType.WHERE,
      all: false,
      datatype: FunnelFilterDataType.STRING,
    });

    updateStepFilters(stepFilters);
  };

  const handleSetFilterValue = (filterIndex: number, values: string[]) => {
    let stepFilters = [...funnelStep.filters];
    stepFilters[filterIndex]['values'] = values;

    updateStepFilters(stepFilters);
  };

  const handleRemoveFilter = (filterIndex: number) => {
    let stepFilters = [...funnelStep.filters];
    stepFilters.splice(filterIndex, 1);

    if (filterIndex === 0 && stepFilters.length)
      stepFilters[0]['condition'] = FunnelFilterConditions.WHERE;

    updateStepFilters(stepFilters);
  };

  return (
    <Flex
      py={'5'}
      borderRadius={'12'}
      border={'1px'}
      borderColor={'grey.10'}
      justifyContent={'space-between'}
      alignItems={'center'}
      direction={'column'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      cursor={'auto'}
      data-testid={'funnel-step'}
    >
      <Flex
        width={'full'}
        alignItems={'center'}
        justifyContent={'space-between'}
        px={'4'}
      >
        <Flex alignItems={'center'} gap={'1'}>
          <FilterNumber index={index} />
          <Box position="relative" ref={eventBoxRef}>
            <Text
              data-testid={'event-name'}
              color={'white.DEFAULT'}
              fontSize={'xs-14'}
              fontWeight={500}
              px={'1'}
              _hover={{ background: 'grey.300', cursor: 'pointer' }}
              lineHeight={'xs-18'}
              onClick={() => setIsEventListOpen(true)}
            >
              {funnelStep?.event || 'Select an Event'}
            </Text>
            <SearchableListDropdown
              isOpen={isEventListOpen}
              isLoading={false}
              data={eventsList}
              onSubmit={handleEventSelection}
              listKey={'id'}
              isNode
            />
          </Box>
        </Flex>
        {showCrossIcon && (
          <IconButton
            data-testid={`remove-funnel-step-${index}`}
            size={'xs'}
            fontWeight={'500'}
            aria-label="remove-component"
            variant={'iconButton'}
            icon={<i className="ri-close-fill"></i>}
            color={'grey.200'}
            opacity={isHovered ? 1 : 0}
            _hover={{ color: 'white', background: 'grey.300' }}
            onClick={() => handleRemoveFunnelStep(index)}
          />
        )}
      </Flex>
      {funnelStep.event && (
        <Divider orientation="horizontal" color={'grey.10'} mt={'3'} />
      )}
      {Boolean(funnelStep.filters.length) &&
        funnelStep.filters.map((filter, index) => (
          <FunnelStepFilterComponent
            filter={filter}
            key={index}
            index={index}
            handleSetFilterValue={handleSetFilterValue}
            handleRemoveFilter={handleRemoveFilter}
          />
        ))}
      {funnelStep.event ? (
        <AddFilter
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventProperties}
          handleAddFilter={handleAddFilter}
        />
      ) : null}
    </Flex>
  );
};
export default FunnelComponentCard;

export const FilterNumber = ({ index }: { index: number }) => {
  return (
    <Flex
      data-testid="event-or-segment-component-index"
      background={LOGAN}
      borderRadius={'2px'}
      textAlign="center"
      fontWeight={500}
      color={'black.100'}
      fontSize={'xs-10'}
      lineHeight={'12px'}
      justifyContent={'center'}
      alignItems={'center'}
      height={'16px'}
      width={'16px'}
      cursor={'grab'}
    >
      {index + 1}
    </Flex>
  );
};
