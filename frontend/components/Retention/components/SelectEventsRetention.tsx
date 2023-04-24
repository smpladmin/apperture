import { Box, Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { MapContext } from '@lib/contexts/mapContext';
import { FunnelStep } from '@lib/domain/funnel';
import { RetentionEvents } from '@lib/domain/retention';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import React, { useContext, useRef, useState } from 'react';
import { Node } from '@lib/domain/node';

type SelectEventsRetentionProps = {
  retentionEvent: FunnelStep;
  eventKey: keyof RetentionEvents;
  index: number;
  retentionEvents: RetentionEvents;
  setRetentionEvents: Function;
};

const SelectEventsRetention = ({
  index,
  retentionEvent,
  eventKey,
  retentionEvents,
  setRetentionEvents,
}: SelectEventsRetentionProps) => {
  const {
    state: { nodes },
  } = useContext(MapContext);

  const eventDropdownRef = useRef(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  useOnClickOutside(eventDropdownRef, () => {
    setIsDropdownOpen(false);
  });

  const handleEventSelection = (event: Node) => {
    const existingFilters = retentionEvents[eventKey].filters;
    const updatedRetentionEvents = {
      ...retentionEvents,
      [eventKey]: { event: event.id, filters: existingFilters },
    };
    setRetentionEvents(updatedRetentionEvents);

    setIsDropdownOpen(false);
  };

  return (
    <Flex gap={3} flexDirection="column">
      <Card p={3} borderRadius={'8'}>
        <Flex width={'full'}>
          <Flex
            width={'full'}
            alignItems={'center'}
            justifyContent={'space-between'}
          >
            <Flex alignItems={'center'} gap={'1'} flexGrow={'1'}>
              <Flex
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
                {String.fromCharCode(65 + index)}
              </Flex>
              <Box
                position="relative"
                w={'full'}
                borderRadius={'4'}
                ref={eventDropdownRef}
              >
                <Text
                  color={retentionEvent.event ? 'black.DEFAULT' : 'grey.600'}
                  fontSize={'xs-14'}
                  fontWeight={retentionEvent.event ? 500 : 400}
                  p={'1'}
                  _hover={{
                    background: 'white.400',
                    cursor: 'pointer',
                    borderRadius: '2px',
                  }}
                  lineHeight={'xs-14'}
                  onClick={() => {
                    setIsDropdownOpen(true);
                  }}
                >
                  {retentionEvent.event || 'Select  Event'}
                </Text>
                <SearchableListDropdown
                  isOpen={isDropdownOpen}
                  isLoading={false}
                  data={nodes}
                  onSubmit={handleEventSelection}
                  listKey={'id'}
                  isNode
                  placeholderText={'Search for events...'}
                  width={'96'}
                />
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Card>
    </Flex>
  );
};

export default SelectEventsRetention;
