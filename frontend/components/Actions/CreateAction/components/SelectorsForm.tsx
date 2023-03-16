import { Flex, Input, Text, Divider, Box } from '@chakra-ui/react';
import {
  ActionGroup,
  CaptureEvent,
  ConditionType,
  UrlMatching,
} from '@lib/domain/action';
import { DEBOUNCED_WAIT_TIME } from '@lib/utils/common';
import { debounce, cloneDeep } from 'lodash';
import React, { Fragment, useEffect, useState } from 'react';
import EventOptions from './EventOptions';
import ConditionChip from './ConditionChip';
import ConditionInput from './ConditionInput';
import AddConditionDropdown from './AddConditionDropdown';
import DividerWithItem from '@components/Divider/DividerWithItem';

type SelectorsFormType = {
  groups: ActionGroup[];
  group: ActionGroup;
  updateGroupAction: Function;
  index: number;
  handleClose: Function;
  isDisabled: Boolean;
};

const conditionMeta = {
  href: { title: 'Link target (href tag)', placeholder: 'Enter Link' },
  selector: {
    title: 'CSS Selector / HTML attribute',
    placeholder: 'eg. button[data-attr=”my-id”]',
  },
  text: {
    title: 'Text',
    placeholder: 'Enter Text Content',
  },
  url: {
    title: 'Page URL',
    placeholder: 'Enter URL',
  },
};

const allConditions = [
  ConditionType.href,
  ConditionType.text,
  ConditionType.url,
  ConditionType.selector,
];

const SelectorsForm = ({
  groups,
  group,
  updateGroupAction,
  index,
  handleClose,
  isDisabled,
}: SelectorsFormType) => {
  const [showCloseButton, setShowCloseButton] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<ConditionType[]>(
    allConditions.filter(
      (key: Exclude<keyof ActionGroup, ['event']>) => group[key] != null
    )
  );

  const addToSelected = (selectedCondition: ConditionType) => {
    setSelectedConditions([...selectedConditions, selectedCondition]);
    handleUpdateGroupAction('', selectedCondition);
  };
  const removeFromSelected = (selectedCondition: ConditionType) => {
    setSelectedConditions(
      selectedConditions.filter((condition) => condition !== selectedCondition)
    );
    handleUpdateGroupAction(null, selectedCondition);
  };
  const handleUpdateGroupAction = (
    value: string | null,
    key: Exclude<keyof ActionGroup, 'event' | 'url_matching'>
  ) => {
    const tempActionGroup = cloneDeep(groups);
    tempActionGroup[index][key] = value;
    updateGroupAction(tempActionGroup);
  };
  const handleUpdateCaptureEvent = (value: CaptureEvent) => {
    const tempActionGroup = cloneDeep(groups);
    tempActionGroup[index] = {
      ...tempActionGroup[index],
      href: null,
      url: null,
      text: null,
      selector: null,
      event: value,
    };
    updateGroupAction(tempActionGroup);
  };

  const debouncedHandleUpdateActionGroup = debounce(
    handleUpdateGroupAction,
    DEBOUNCED_WAIT_TIME
  );

  const dropDownHandler = (value: UrlMatching) => {
    const tempActionGroup = cloneDeep(groups);
    tempActionGroup[index].url_matching = value;
    updateGroupAction(tempActionGroup);
  };

  useEffect(() => {
    setSelectedConditions(
      [
        ConditionType.href,
        ConditionType.selector,
        ConditionType.text,
        ConditionType.url,
      ].filter(
        (key: Exclude<keyof ActionGroup, ['event']>) => group[key] !== null
      )
    );
  }, [group]);

  return (
    <Flex
      direction={'column'}
      mt={'3'}
      pt={'2'}
      pb={'6'}
      px={'5'}
      w="full"
      onMouseEnter={() => setShowCloseButton(true)}
      onMouseLeave={() => setShowCloseButton(false)}
    >
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Text pb={'4'} fontSize={'xs-16'} lineHeight={'xs-22'} fontWeight={500}>
          GROUP {index + 1}
        </Text>

        {groups.length > 1 && (
          <i
            hidden={!showCloseButton}
            style={{ cursor: 'pointer', color: '#B2B2B5' }}
            className="ri-close-line"
            onClick={() => handleClose(index)}
          />
        )}
      </Flex>
      <EventOptions
        isDisabled={isDisabled}
        captureEvent={group.event}
        updateHandler={handleUpdateCaptureEvent}
      />
      {selectedConditions.length > 0 && (
        <Flex
          direction={'column'}
          gap={'2'}
          data-testid={'action-form'}
          hidden={group.event === CaptureEvent.PAGEVIEW}
        >
          {selectedConditions.map((condition, index) => (
            <Fragment key={'divider-' + condition}>
              {index > 0 && (
                <DividerWithItem
                  key={'divider-' + condition}
                  color={'grey.100'}
                  mt={3}
                >
                  <Text
                    fontSize={'xs-10'}
                    lineHeight={'xs-12'}
                    fontWeight={500}
                    bg={'white'}
                    px={1}
                    borderRadius={4}
                    color={'grey.200'}
                  >
                    AND
                  </Text>
                </DividerWithItem>
              )}
              {condition === ConditionType.url ? (
                <ConditionInput
                  key={condition}
                  updateHandler={debouncedHandleUpdateActionGroup}
                  closeHandler={removeFromSelected}
                  title={conditionMeta[condition].title}
                  type={condition}
                  condition={condition}
                  defaultValue={group[condition]}
                  placeholder={conditionMeta[condition].placeholder}
                  criteriaDropdownList={[
                    UrlMatching.CONTAINS,
                    UrlMatching.EXACT,
                    UrlMatching.REGEX,
                  ]}
                  showCriteriaDropdown={true}
                  currentCriteria={group.url_matching || UrlMatching.CONTAINS}
                  dropDownHandler={dropDownHandler}
                  isDisabled={isDisabled}
                />
              ) : (
                <ConditionInput
                  key={condition}
                  updateHandler={debouncedHandleUpdateActionGroup}
                  closeHandler={removeFromSelected}
                  title={conditionMeta[condition].title}
                  type={condition}
                  condition={condition}
                  defaultValue={group[condition]}
                  placeholder={conditionMeta[condition].placeholder}
                  isDisabled={isDisabled}
                />
              )}
            </Fragment>
          ))}
        </Flex>
      )}
      {group.event === CaptureEvent.AUTOCAPTURE &&
        (selectedConditions.length === 0 ? (
          <Flex direction={'column'}>
            <Text
              fontSize={'xs-12'}
              lineHeight={'xs-16'}
              fontWeight={500}
              color="black.200"
              py={3}
            >
              Select Conditions
            </Text>
            <Flex flexWrap={'wrap'}>
              {allConditions.map((condition: ConditionType) => (
                <ConditionChip
                  key={`chip-${condition}`}
                  condition={condition}
                  addCondition={addToSelected}
                  title={conditionMeta[condition].title}
                />
              ))}
            </Flex>
          </Flex>
        ) : (
          allConditions.filter(
            (condition) => !selectedConditions.includes(condition)
          ).length > 0 &&
          !isDisabled && (
            <AddConditionDropdown
              conditionList={allConditions.filter(
                (condition) => !selectedConditions.includes(condition)
              )}
              onClickHandler={addToSelected}
            />
          )
        ))}
      <Flex
        direction={'column'}
        gap={'2'}
        data-testid={'action-form'}
        hidden={group.event === CaptureEvent.AUTOCAPTURE}
      >
        <ConditionInput
          updateHandler={debouncedHandleUpdateActionGroup}
          closeHandler={removeFromSelected}
          title="Page URL"
          type={'url'}
          condition={ConditionType.url}
          defaultValue={group.url}
          placeholder={'Enter URL'}
          hideCloseButton={true}
          criteriaDropdownList={[
            UrlMatching.CONTAINS,
            UrlMatching.EXACT,
            UrlMatching.REGEX,
          ]}
          showCriteriaDropdown={true}
          currentCriteria={group.url_matching || UrlMatching.CONTAINS}
          dropDownHandler={dropDownHandler}
          isDisabled={isDisabled}
        />
      </Flex>
    </Flex>
  );
};

export default SelectorsForm;
