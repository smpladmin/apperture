import { Flex } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import EventsConnectingLine from './EventsConnectingLine';
import Autocomplete from './Autocomplete';
import { MapContext } from '@lib/contexts/mapContext';

type EventFieldsValue = {
  eventFieldsValue: Array<any>;
  setEventFieldsValue: Function;
};

const EventFields = ({
  eventFieldsValue,
  setEventFieldsValue,
}: EventFieldsValue) => {
  const {
    state: { edges },
  } = useContext(MapContext);

  const [showCrossIcon, setShowCrossIcon] = useState(false);
  const [suggestions, setSuggestions] = useState<Array<any>>([]);
  const [focusedInputIndex, setFocusedInputIndex] = useState(-1);

  const dragItem = useRef<{ index: number | null }>({ index: null });
  const dragOverItem = useRef<{ index: number | null }>({ index: null });

  useEffect(() => {
    if (eventFieldsValue.length <= 2) setShowCrossIcon(false);
    else setShowCrossIcon(true);
  }, [eventFieldsValue]);

  const removeInputField = (index: number) => {
    if (eventFieldsValue.length === 2) return;
    let deletedInputValues = [...eventFieldsValue];
    deletedInputValues.splice(index, 1);
    setEventFieldsValue(deletedInputValues);
  };

  const handleInputChangeValue = (eventValue: string, index: number) => {
    let matches = [];
    if (eventValue) {
      matches = edges
        .filter((item: any) => {
          return (
            item?.id?.toLowerCase()?.startsWith(eventValue.toLowerCase()) ||
            item?.id?.toLowerCase()?.includes(eventValue?.toLowerCase())
          );
        })
        .slice(0, 10);
      matches?.sort((a, b) => a?.id.length - b?.id.length);
    }
    setSuggestions(matches);
    const inputValues = [...eventFieldsValue];
    inputValues[index]['event'] = eventValue;
    setEventFieldsValue(inputValues);
  };

  const saveDragStartIndex = (i: number) => {
    dragItem.current.index = i;
  };
  const saveDragEnterIndex = (i: number) => {
    dragOverItem.current.index = i;
  };

  const handleSort = () => {
    if (dragItem.current.index === null || dragOverItem.current.index === null)
      return;

    const inputValues = [...eventFieldsValue];
    const [itemToReplace] = inputValues.splice(dragItem.current.index, 1);
    inputValues.splice(dragOverItem.current.index, 0, itemToReplace);

    setEventFieldsValue(inputValues);
    dragItem.current.index = null;
    dragOverItem.current.index = null;
  };
  return (
    <Flex gap={'4'}>
      <EventsConnectingLine eventsLength={eventFieldsValue.length} />
      <Flex direction={'column'} gap={'4'} w={'full'}>
        {eventFieldsValue.map((inputValue, i) => {
          return (
            <Autocomplete
              key={i}
              data={inputValue}
              index={i}
              handleSort={handleSort}
              handleInputChangeValue={handleInputChangeValue}
              removeInputField={removeInputField}
              showCrossIcon={showCrossIcon}
              saveDragStartIndex={saveDragStartIndex}
              saveDragEnterIndex={saveDragEnterIndex}
              suggestions={suggestions}
              setSuggestions={setSuggestions}
              focusedInputIndex={focusedInputIndex}
              setFocusedInputIndex={setFocusedInputIndex}
            />
          );
        })}
      </Flex>
    </Flex>
  );
};

export default EventFields;
