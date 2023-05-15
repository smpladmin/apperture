import { Box, Flex } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import React from 'react';
import { FunnelStep } from '@lib/domain/funnel';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd';
import FunnelComponentCard from './FunnelCard';

type funnelSteps = {
  funnelSteps: Array<FunnelStep>;
  setFunnelSteps: Function;
  randomSequence: boolean;
  eventProperties: string[];
  loadingEventProperties: boolean;
};

const EventFields = ({
  funnelSteps,
  setFunnelSteps,
  randomSequence,
  eventProperties,
  loadingEventProperties,
}: funnelSteps) => {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const inputValues = [...funnelSteps];
    const [itemToReplace] = inputValues.splice(result.source.index, 1);
    inputValues.splice(result.destination.index, 0, itemToReplace);
    setFunnelSteps(inputValues);
  };

  return (
    <Flex gap={{ base: '2', md: '3' }}>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="droppable">
          {(provided) => (
            <Flex
              w={'full'}
              {...provided.droppableProps}
              ref={provided.innerRef}
              data-testid={'droppable'}
              direction={'column'}
              gap={'4'}
            >
              {funnelSteps.map((funnelStep, i, funnelSteps) => {
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
                        data-testid={'draggable-input'}
                      >
                        <FunnelComponentCard
                          index={i}
                          funnelStep={funnelStep}
                          funnelSteps={funnelSteps}
                          setFunnelSteps={setFunnelSteps}
                          hideNumbers={i != 0 && randomSequence}
                          eventProperties={eventProperties}
                          loadingEventProperties={loadingEventProperties}
                        />
                      </Box>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </Flex>
          )}
        </Droppable>
      </DragDropContext>
    </Flex>
  );
};

export default EventFields;
