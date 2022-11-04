import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import Image from 'next/image';
import React, { ChangeEvent, useEffect, useRef, useState } from 'react';
import HorizontalParallelLineIcon from '@assets/icons/horizontal-parallel-line.svg';
import CrossIcon from '@assets/icons/cross-icon.svg';
import FunnelIcon from '@assets/icons/funnel-icon.svg';
import EventsConnectingLine from './EventsConnectingLine';

type EventFieldsValue = {
  eventFieldsValue: Array<any>;
  setEventFieldsValue: Function;
};

const EventFields = ({
  eventFieldsValue,
  setEventFieldsValue,
}: EventFieldsValue) => {
  const [showCrossIcon, setShowCrossIcon] = useState(false);

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

  const handleInputChangeValue = (
    e: ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const inputValues = [...eventFieldsValue];
    inputValues[index].eventName = e.target.value;
    setEventFieldsValue(inputValues);
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
            <Flex
              key={i}
              draggable
              onDragStart={() => (dragItem.current.index = i)}
              onDragEnter={() => (dragOverItem.current.index = i)}
              onDragEnd={handleSort}
              onDragOver={(event) => event?.preventDefault()}
            >
              <InputGroup>
                <InputLeftElement
                  cursor={'all-scroll'}
                  h={'12'}
                  display={'flex'}
                  alignItems={'center'}
                >
                  <Flex justifyContent={'center'}>
                    <Image
                      src={HorizontalParallelLineIcon}
                      alt={'parallel-line-icon'}
                    />
                  </Flex>
                </InputLeftElement>
                <Input
                  py={'4'}
                  size={'lg'}
                  type={'text'}
                  autoFocus
                  fontSize={'xs-14'}
                  lineHeight={'xs-14'}
                  fontWeight={'medium'}
                  textColor={'white.DEFAULT'}
                  bg={'rgba(255, 255, 255, 0.04)'}
                  border={'0'}
                  borderRadius={'200'}
                  placeholder={'Add event'}
                  _placeholder={{
                    fontSize: 'xs-14',
                    lineHeight: 'xs-14',
                    fontWeight: 400,
                    color: 'rgba(255, 255, 255, 0.2)',
                  }}
                  value={inputValue?.eventName}
                  onChange={(e) => handleInputChangeValue(e, i)}
                />
                <InputRightElement
                  color={'white'}
                  cursor={'pointer'}
                  h={'12'}
                  alignItems={'center'}
                  pr={'4'}
                >
                  <Flex gap={'2'} alignItems={'center'}>
                    <Box minH={'4'} minW={'4'} p={'1px'} cursor={'not-allowed'}>
                      <Image src={FunnelIcon} />
                    </Box>
                    {showCrossIcon ? (
                      <Box minH={'5'} minW={'5'}>
                        <Image
                          src={CrossIcon}
                          onClick={() => removeInputField(i)}
                          alt={'cross-icon'}
                        />
                      </Box>
                    ) : null}
                  </Flex>
                </InputRightElement>
              </InputGroup>
            </Flex>
          );
        })}
      </Flex>
    </Flex>
  );
};

export default EventFields;
