import { Flex, Input, Text, Divider } from '@chakra-ui/react';
import { ActionGroup, CaptureEvent } from '@lib/domain/action';
import { DEBOUNCED_WAIT_TIME } from '@lib/utils/common';
import { debounce, cloneDeep } from 'lodash';
import React from 'react';
import EventOptions from './EventOptions';

type SelectorsFormType = {
  captureEvent: CaptureEvent;
  setCaptureEvent: Function;
  groups: ActionGroup[];
  updateGroupAction: Function;
};

const SelectorsForm = ({
  captureEvent,
  setCaptureEvent,
  groups,
  updateGroupAction,
}: SelectorsFormType) => {
  const handleUpdateActionGroup = debounce(
    (value: string, key: keyof ActionGroup) => {
      const tempActionGroup = cloneDeep(groups);
      tempActionGroup[0][key] = value;
      updateGroupAction(tempActionGroup);
    },
    DEBOUNCED_WAIT_TIME
  );

  return (
    <Flex
      direction={'column'}
      gap={'6'}
      mt={'3'}
      pt={'5'}
      pb={'6'}
      px={'5'}
      borderWidth={'0.4px'}
      borderRadius={'12'}
      borderColor={'grey.100'}
    >
      <EventOptions
        captureEvent={captureEvent}
        setCaptureEvent={setCaptureEvent}
      />
      <Flex direction={'column'} gap={'2'}>
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
          {'Link target (href tag)'}
        </Text>
        <Input
          px={'3'}
          py={'2'}
          placeholder="Enter Link"
          focusBorderColor="black.100"
          _placeholder={{
            fontSize: 'base',
            lineHeight: 'base',
            fontWeight: '400',
            color: 'grey.100',
          }}
          defaultValue={groups[0].href}
          onChange={(e) => handleUpdateActionGroup(e.target.value, 'href')}
        />
      </Flex>

      <Divider opacity={'1'} borderColor={'white.200'} />

      <Flex direction={'column'} gap={'2'}>
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
          {'CSS Selector / HTML attribute'}
        </Text>
        <Input
          px={'3'}
          py={'2'}
          placeholder="eg. button[data-attr=”my-id”]"
          focusBorderColor="black.100"
          _placeholder={{
            fontSize: 'base',
            lineHeight: 'base',
            fontWeight: '400',
            color: 'grey.100',
          }}
          defaultValue={groups[0].selector}
          onChange={(e) => handleUpdateActionGroup(e.target.value, 'selector')}
        />
      </Flex>

      <Divider opacity={'1'} borderColor={'white.200'} />

      <Flex direction={'column'} gap={'2'}>
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
          {'Text'}
        </Text>
        <Input
          px={'3'}
          py={'2'}
          fontSize={'base'}
          focusBorderColor="black.100"
          placeholder="Enter Text Content"
          _placeholder={{
            fontSize: 'base',
            lineHeight: 'base',
            fontWeight: '400',
            color: 'grey.100',
          }}
          defaultValue={groups[0].text}
          onChange={(e) => handleUpdateActionGroup(e.target.value, 'text')}
        />
      </Flex>

      <Divider opacity={'1'} borderColor={'white.200'} gap={'2'} />

      <Flex direction={'column'} gap={'2'}>
        <Text fontSize={'xs-14'} lineHeight={'xs-14'} fontWeight={'500'}>
          {'Page URL (contains)'}
        </Text>
        <Input
          px={'3'}
          py={'2'}
          focusBorderColor="black.100"
          placeholder="Enter URL"
          _placeholder={{
            fontSize: 'base',
            lineHeight: 'base',
            fontWeight: '400',
            color: 'grey.100',
          }}
          defaultValue={groups[0].url}
          onChange={(e) => handleUpdateActionGroup(e.target.value, 'url')}
        />
      </Flex>
    </Flex>
  );
};

export default SelectorsForm;
