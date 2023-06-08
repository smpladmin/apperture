import { Box, Flex, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import React, {
  Fragment,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AddFilter from '@components/StepFilters/components/AddFilter';
import FunnelStepFilterComponent from '@components/StepFilters/StepFilters';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { FunnelStep } from '@lib/domain/funnel';
import { MapContext } from '@lib/contexts/mapContext';
import { cloneDeep } from 'lodash';
import { GREY_500, WHITE_DEFAULT } from '@theme/index';
import { Node } from '@lib/domain/node';
import { DotsSixVertical, Trash } from 'phosphor-react';
import { WhereFilter } from '@lib/domain/common';

type FunnelComponentCardProps = {
  index: number;
  funnelStep: FunnelStep;
  funnelSteps: FunnelStep[];
  setFunnelSteps: Function;
  hideNumbers: boolean;
};

const FunnelComponentCard = ({
  index,
  funnelStep,
  funnelSteps,
  setFunnelSteps,
  hideNumbers,
}: FunnelComponentCardProps) => {
  const {
    state: { nodes },
  } = useContext(MapContext);

  const eventBoxRef = useRef(null);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isEventListOpen, setIsEventListOpen] = useState<boolean>(false);
  const [eventsList, setEventsList] = useState<Array<Node>>([]);
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

  const handleEventSelection = (selection: Node) => {
    setIsEventListOpen(false);
    const tempFunnelSteps = cloneDeep(funnelSteps);
    tempFunnelSteps[index]['event'] = selection.id;
    setFunnelSteps(tempFunnelSteps);
    setIsHovered(false);
  };

  const handleRemoveFunnelStep = (index: number) => {
    if (funnelSteps.length <= 2) return;
    let tempFunnelSteps = [...funnelSteps];
    tempFunnelSteps.splice(index, 1);
    setFunnelSteps(tempFunnelSteps);
  };

  const updateStepFilters = (stepFilters: WhereFilter[]) => {
    const tempFunnelSteps = cloneDeep(funnelSteps);
    tempFunnelSteps[index]['filters'] = stepFilters;
    setFunnelSteps(tempFunnelSteps);
  };

  return (
    <Flex
      p={'3'}
      borderRadius={'8px'}
      border={'1px'}
      borderColor={isHovered ? 'grey.700 ' : 'white.200'}
      direction={'column'}
      cursor={'grab'}
      data-testid={'funnel-step'}
      backgroundColor={'white.DEFAULT'}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      gap={'2'}
    >
      <Flex width={'full'}>
        <Flex
          width={'full'}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <Flex alignItems={'center'} gap={'1'} flexGrow={'1'}>
            <FilterNumber index={index} isHovered={isHovered || hideNumbers} />
            <Box
              position="relative"
              ref={eventBoxRef}
              w={'full'}
              borderRadius={'4'}
            >
              <Text
                data-testid={'event-name'}
                color={funnelStep?.event ? 'black.DEFAULT' : 'grey.600'}
                fontSize={'xs-14'}
                fontWeight={funnelStep?.event ? 500 : 400}
                p={'1'}
                _hover={{ background: 'white.400', cursor: 'pointer' }}
                lineHeight={'xs-14'}
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
                placeholderText={'Search for events...'}
                width={'96'}
              />
            </Box>
          </Flex>
          {showCrossIcon && (
            <Flex
              data-testid={`remove-funnel-step-${index}`}
              fontWeight={'500'}
              color={'grey.200'}
              cursor={'pointer'}
              opacity={isHovered ? 1 : 0}
              onClick={() => handleRemoveFunnelStep(index)}
            >
              <Trash size={14} color={GREY_500} />
            </Flex>
          )}
        </Flex>
      </Flex>

      {Boolean(funnelStep.filters.length) && (
        <Flex direction={'column'} gap={'2'}>
          {funnelStep.filters.map((filter, index, filters) => (
            <Fragment key={index}>
              <FunnelStepFilterComponent
                index={index}
                filter={filter}
                filters={filters}
                setFilters={updateStepFilters}
                event={funnelStep?.event}
                loadingEventProperties={false}
              />
            </Fragment>
          ))}
        </Flex>
      )}
      {funnelStep.event ? (
        <AddFilter
          filters={funnelStep.filters}
          setFilters={updateStepFilters}
          event={funnelStep?.event}
          loadingEventProperties={false}
        />
      ) : null}
    </Flex>
  );
};
export default FunnelComponentCard;

export const FilterNumber = ({
  index,
  isHovered,
}: {
  index: number;
  isHovered: boolean;
}) => {
  return (
    <Flex
      data-testid="event-or-segment-component-index"
      background={'blue.500'}
      borderRadius={'4px'}
      textAlign="center"
      fontWeight={600}
      color={'white'}
      fontSize={'xs-10'}
      lineHeight={'xs-10'}
      justifyContent={'center'}
      alignItems={'center'}
      height={'5'}
      width={'5'}
      cursor={'grab'}
    >
      {isHovered ? (
        <DotsSixVertical size={16} weight="bold" color={WHITE_DEFAULT} />
      ) : (
        index + 1
      )}
    </Flex>
  );
};
