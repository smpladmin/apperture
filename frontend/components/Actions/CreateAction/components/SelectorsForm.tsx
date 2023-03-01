import { Flex, Input, Text, Divider, Box } from '@chakra-ui/react';
import { ActionGroup, CaptureEvent, ConditionType } from '@lib/domain/action';
import { DEBOUNCED_WAIT_TIME } from '@lib/utils/common';
import { debounce, cloneDeep } from 'lodash';
import React, { useState } from 'react';
import EventOptions from './EventOptions';
import ConditionChip from './ConditionChip';
import ConditionInput from './ConditionInput';
import AddConditionDropdown from './AddConditionDropdown';

type SelectorsFormType = {
  captureEvent: CaptureEvent;
  captureEvents: CaptureEvent[];
  setCaptureEvents: Function;
  groups: ActionGroup[];
  group: ActionGroup;
  updateGroupAction: Function;
  index: number;
};

const SelectorsForm = ({
  captureEvent,
  captureEvents,
  setCaptureEvents,
  groups,
  group,
  updateGroupAction,
  index,
}: SelectorsFormType) => {
  const [selectedConditions, setSelectedConditions] = useState<ConditionType[]>(
    []
  );
  const [unSelectedConditions, setUnSelectedConditions] = useState<
    ConditionType[]
  >([
    ConditionType.href,
    ConditionType.text,
    ConditionType.url,
    ConditionType.css,
  ]);

  const addToSelected = (selectedCondition: ConditionType) => {
    setSelectedConditions([...selectedConditions, selectedCondition]);
    setUnSelectedConditions(
      unSelectedConditions.filter(
        (condition) => condition !== selectedCondition
      )
    );
  };
  const removeFromSelected = (selectedCondition: ConditionType) => {
    setUnSelectedConditions([...unSelectedConditions, selectedCondition]);
    setSelectedConditions(
      selectedConditions.filter((condition) => condition !== selectedCondition)
    );
  };
  const handleUpdateCaptureEvent = (value: CaptureEvent) => {
    const tempCaptureEvents = cloneDeep(captureEvents);
    tempCaptureEvents[index] = value;
    setCaptureEvents(tempCaptureEvents);
  };
  const debouncedHandleUpdateActionGroup = debounce(
    (value: string, key: Exclude<keyof ActionGroup, 'event'>) => {
      const tempActionGroup = cloneDeep(groups);
      tempActionGroup[index][key] = value;
      updateGroupAction(tempActionGroup);
    },
    DEBOUNCED_WAIT_TIME
  );

  return (
    <Flex direction={'column'} mt={'3'} pt={'2'} pb={'6'} px={'5'} w="full">
      <Text pb={'4'} fontSize={'xs-16'} lineHeight={'xs-22'} fontWeight={500}>
        GROUP {index + 1}
      </Text>
      <EventOptions
        captureEvent={captureEvent}
        updateHandler={handleUpdateCaptureEvent}
      />
      {selectedConditions.length > 0 && (
        <Flex
          direction={'column'}
          gap={'2'}
          data-testid={'action-form'}
          hidden={captureEvent === CaptureEvent.PAGEVIEW}
        >
          {selectedConditions.includes(ConditionType.href) && (
            <ConditionInput
              updateHandler={debouncedHandleUpdateActionGroup}
              title="Link target (href tag)"
              type={'href'}
              defaultValue={group.href || ''}
              placeholder={'Enter Link'}
            />
          )}
          {selectedConditions.includes(ConditionType.css) && (
            <ConditionInput
              updateHandler={debouncedHandleUpdateActionGroup}
              title="CSS Selector / HTML attribute"
              type={'selector'}
              defaultValue={group.selector || ''}
              placeholder={'eg. button[data-attr=”my-id”]'}
            />
          )}
          {selectedConditions.includes(ConditionType.text) && (
            <ConditionInput
              updateHandler={debouncedHandleUpdateActionGroup}
              title="Text"
              type={'text'}
              defaultValue={group.text || ''}
              placeholder={'Enter Text Content'}
            />
          )}

          {selectedConditions.includes(ConditionType.url) && (
            <ConditionInput
              updateHandler={debouncedHandleUpdateActionGroup}
              title="Page URL (contains)"
              type={'url'}
              defaultValue={group.url || ''}
              placeholder={'Enter URL'}
            />
          )}
        </Flex>
      )}
      {captureEvent === CaptureEvent.AUTOCAPTURE &&
        (selectedConditions.length === 0 ? (
          <Flex direction={'column'}>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              fontWeight={500}
              color="black.200"
            >
              Select Conditions
            </Text>
            <Flex flexWrap={'wrap'}>
              {unSelectedConditions.map((selector: ConditionType) => (
                <ConditionChip
                  key={`chip-${selector}`}
                  condition={selector}
                  addCondition={addToSelected}
                />
              ))}
            </Flex>
          </Flex>
        ) : (
          unSelectedConditions.length > 0 && (
            <AddConditionDropdown
              conditionList={unSelectedConditions}
              onClickHandler={addToSelected}
            />
          )
        ))}
      <Flex
        direction={'column'}
        gap={'2'}
        data-testid={'action-form'}
        hidden={captureEvent === CaptureEvent.AUTOCAPTURE}
      >
        <ConditionInput
          updateHandler={debouncedHandleUpdateActionGroup}
          title="Page URL (contains)"
          type={'url'}
          defaultValue={group.url || ''}
          placeholder={'Enter URL'}
        />
      </Flex>
    </Flex>
  );
};

export default SelectorsForm;
