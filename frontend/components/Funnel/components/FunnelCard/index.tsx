import { Box, Flex, Text } from '@chakra-ui/react';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import React, {
  Fragment,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import AddFilter from '../../../StepFilters/components/AddFilter';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { FunnelStep } from '@lib/domain/funnel';
import { MapContext } from '@lib/contexts/mapContext';
import FunnelStepFilterComponent from '../../../StepFilters/StepFilters';
import { useRouter } from 'next/router';
import { getEventProperties } from '@lib/services/datasourceService';
import { cloneDeep } from 'lodash';
import { FilterType } from '@lib/domain/segment';
import { GREY_500, WHITE_DEFAULT } from '@theme/index';
import { Node } from '@lib/domain/node';
import { DotsSixVertical, Trash } from 'phosphor-react';
import {
  WhereFilter,
  FilterConditions,
  FilterOperatorsString,
  FilterDataType,
  ISFilterOperators,
  FilterOperators,
  FilterOperatorsDatatypeMap,
} from '@lib/domain/common';

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

  const updateStepFilters = (stepFilters: WhereFilter[]) => {
    const tempFunnelSteps = cloneDeep(funnelSteps);
    tempFunnelSteps[index]['filters'] = stepFilters;
    setFunnelSteps(tempFunnelSteps);
  };

  const handleAddFilter = (value: string) => {
    const getFunnelFilterCondition = (stepFilters: WhereFilter[]) => {
      return !stepFilters.length
        ? FilterConditions.WHERE
        : FilterConditions.AND;
    };

    const stepFilters = [...funnelStep.filters];
    stepFilters.push({
      condition: getFunnelFilterCondition(stepFilters),
      operand: value,
      operator: FilterOperatorsString.IS,
      values: [],
      type: FilterType.WHERE,
      all: false,
      datatype: FilterDataType.STRING,
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
      stepFilters[0]['condition'] = FilterConditions.WHERE;

    updateStepFilters(stepFilters);
  };

  const handleSetFilterProperty = (filterIndex: number, property: string) => {
    let stepFilters = [...funnelStep.filters];
    stepFilters[filterIndex]['operand'] = property;

    updateStepFilters(stepFilters);
  };

  const handleFilterDatatypeChange = (
    filterIndex: number,
    selectedDatatype: FilterDataType
  ) => {
    let stepFilters = [...funnelStep.filters];
    // @ts-ignore
    stepFilters[filterIndex]['operator'] =
      FilterOperatorsDatatypeMap[selectedDatatype][0];
    stepFilters[filterIndex]['values'] = [];
    stepFilters[filterIndex]['datatype'] = selectedDatatype;

    updateStepFilters(stepFilters);
  };

  const handleOperatorChange = (
    filterIndex: number,
    selectedOperator: FilterOperators
  ) => {
    let stepFilters = [...funnelStep.filters];
    /*
    While changing operator from `is/is_not` to `contains/does_not_contain`
    the element to select filter value changes from a Selectable Dropdown to an Input Field,
    hence the selected value needs a reset.
    */
    if (stepFilters[filterIndex].datatype === FilterDataType.STRING) {
      const isMatchingFilter =
        ISFilterOperators.includes(
          stepFilters[filterIndex].operator as FilterOperatorsString
        ) ===
        ISFilterOperators.includes(selectedOperator as FilterOperatorsString);

      if (!isMatchingFilter) {
        stepFilters[index].values = [];
      }
    }
    stepFilters[filterIndex].operator = selectedOperator;

    updateStepFilters(stepFilters);
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
          {funnelStep.filters.map((filter, index) => (
            <Fragment key={index}>
              <FunnelStepFilterComponent
                index={index}
                filter={filter}
                eventProperties={eventProperties}
                loadingEventProperties={loadingEventProperties}
                handleSetFilterProperty={handleSetFilterProperty}
                handleSetFilterValue={handleSetFilterValue}
                handleRemoveFilter={handleRemoveFilter}
                handleFilterDatatypeChange={handleFilterDatatypeChange}
                handleOperatorChange={handleOperatorChange}
              />
            </Fragment>
          ))}
        </Flex>
      )}
      {funnelStep.event ? (
        <AddFilter
          filters={funnelStep.filters}
          eventProperties={eventProperties}
          loadingEventProperties={loadingEventProperties}
          handleAddFilter={handleAddFilter}
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
