import { Box, Flex } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import React, { useContext, useEffect, useState } from 'react';
import EventsConnectingLine from './EventsConnectingLine';
import Autocomplete from './Autocomplete';
import { MapContext } from '@lib/contexts/mapContext';
import { NodeType } from '@lib/types/graph';
import { FunnelStep } from '@lib/domain/funnel';
import {
  filterFunnelSteps,
  getCountOfValidAddedSteps,
  isEveryNonEmptyStepValid,
} from '../util';
import { getTransientFunnelData } from '@lib/services/funnelService';
import { useRouter } from 'next/router';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import { getSearchResult } from '@lib/utils/common';
import usePrevious from '@lib/hooks/usePrevious';
import isEqual from 'lodash/isEqual';

type EventFieldsValue = {
  eventFieldsValue: Array<FunnelStep>;
  setEventFieldsValue: Function;
  setFunnelData: Function;
};

const EventFields = ({
  eventFieldsValue,
  setEventFieldsValue,
  setFunnelData,
}: EventFieldsValue) => {
  const {
    state: { nodes },
  } = useContext(MapContext);
  const router = useRouter();
  const { dsId } = router.query;

  const [stepDragCount, setStepDragCount] = useState(0);
  const [showCrossIcon, setShowCrossIcon] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<NodeType>>([]);
  const [focusedInputIndex, setFocusedInputIndex] = useState(-1);
  const [stepRemovedCount, setStepRemovedCount] = useState(0);
  const previousStepsState = usePrevious(eventFieldsValue);

  useEffect(() => {
    setSuggestions(nodes);
  }, [focusedInputIndex, nodes]);

  useEffect(() => {
    if (eventFieldsValue.length <= 2) setShowCrossIcon(false);
    else setShowCrossIcon(true);
  }, [eventFieldsValue]);

  useEffect(() => {
    if (!stepDragCount || isEqual(eventFieldsValue, previousStepsState)) return;
    getFunnelData();
  }, [stepDragCount]);

  useEffect(() => {
    if (!stepRemovedCount) return;
    getFunnelData();
  }, [stepRemovedCount]);

  const removeInputField = (index: number) => {
    if (eventFieldsValue.length <= 2) return;
    let deletedInputValues = [...eventFieldsValue];
    deletedInputValues.splice(index, 1);
    setEventFieldsValue(deletedInputValues);
    setStepRemovedCount((count) => count + 1);
  };

  const handleInputChangeValue = (eventValue: string, index: number) => {
    const matches = getSearchResult(nodes, eventValue, {
      keys: ['id'],
    }) as NodeType[];
    setSuggestions(eventValue ? matches : nodes);

    const inputValues = [...eventFieldsValue];
    inputValues[index]['event'] = eventValue;
    setEventFieldsValue(inputValues);
  };

  const getFunnelData = async () => {
    if (
      getCountOfValidAddedSteps(eventFieldsValue, nodes) < 2 ||
      !isEveryNonEmptyStepValid(eventFieldsValue, nodes)
    )
      return;
    setFunnelData([]);
    const res = await getTransientFunnelData(
      dsId as string,
      filterFunnelSteps(eventFieldsValue)
    );
    setFunnelData(res);
  };

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const inputValues = [...eventFieldsValue];
    const [itemToReplace] = inputValues.splice(result.source.index, 1);
    inputValues.splice(result.destination.index, 0, itemToReplace);
    setEventFieldsValue(inputValues);
    setStepDragCount((count) => count + 1);
  };

  return (
    <Flex gap={{ base: '2', md: '4' }}>
      <EventsConnectingLine eventsLength={eventFieldsValue.length} />
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <Box
              w={'full'}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {eventFieldsValue.map((inputValue, i) => {
                return (
                  <Draggable
                    key={`event-${i}`}
                    draggableId={`event-${i}`}
                    index={i}
                  >
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <Autocomplete
                          data={inputValue}
                          index={i}
                          handleInputChangeValue={handleInputChangeValue}
                          removeInputField={removeInputField}
                          showCrossIcon={showCrossIcon}
                          suggestions={suggestions}
                          setSuggestions={setSuggestions}
                          focusedInputIndex={focusedInputIndex}
                          setFocusedInputIndex={setFocusedInputIndex}
                          getFunnelData={getFunnelData}
                        />
                      </Box>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </Box>
          )}
        </Droppable>
      </DragDropContext>
    </Flex>
  );
};

export default EventFields;
