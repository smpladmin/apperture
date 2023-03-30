import { Box, Button, Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import { BLACK_DEFAULT } from '@theme/index';
import { Plus, Trash } from 'phosphor-react';
import React, { useRef, useState } from 'react';

type AddBreakdownProps = {
  breakdown: string[];
  setBreakdown: Function;
  loadingEventProperties: boolean;
  eventProperties: string[];
};

const AddBreakdown = ({
  breakdown,
  setBreakdown,
  loadingEventProperties,
  eventProperties,
}: AddBreakdownProps) => {
  const [isPropertiesListOpen, setIsPropertiesListOpen] = useState(false);
  const [breakdownCardHovered, setBreakdownCardHovered] = useState(false);
  const breakdownRef = useRef(null);

  useOnClickOutside(breakdownRef, () => setIsPropertiesListOpen(false));

  const handleAddBreakdown = (value: string) => {
    setIsPropertiesListOpen(false);
    setBreakdown([value]);
  };

  const handleRemoveBreakdown = () => {
    setBreakdown([]);
  };

  return (
    <Flex direction={'column'} gap={'3'}>
      <Flex justifyContent={'space-between'}>
        <Text
          fontSize={'xs-12'}
          lineHeight={'xs-12'}
          fontWeight={'400'}
          color={'grey.500'}
        >
          Breakdown
        </Text>
        {!breakdown.length && (
          <Box position={'relative'} ref={breakdownRef}>
            <Button
              h={5.5}
              minW={5.5}
              w={5.5}
              p={0}
              data-testid={'add-breakdown'}
              onClick={() => setIsPropertiesListOpen(true)}
              cursor={'pointer'}
              variant={'secondary'}
            >
              <Plus size={14} color={BLACK_DEFAULT} weight={'bold'} />
            </Button>
            <SearchableListDropdown
              isOpen={isPropertiesListOpen}
              isLoading={loadingEventProperties}
              data={eventProperties}
              onSubmit={handleAddBreakdown}
              width={'96'}
            />
          </Box>
        )}
      </Flex>
      {!!breakdown.length && (
        <Card borderColor={'white.200'} borderRadius={'8'}>
          <Flex
            w={'full'}
            onMouseEnter={() => setBreakdownCardHovered(true)}
            onMouseLeave={() => setBreakdownCardHovered(false)}
            justifyContent={'space-between'}
          >
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'500'}
              data-testid={'breakdown-name'}
            >
              {breakdown.join()}
            </Text>
            {breakdownCardHovered && (
              <Box
                onClick={handleRemoveBreakdown}
                data-testid={'remove-breakdown'}
                cursor={'pointer'}
              >
                <Trash size={14} />
              </Box>
            )}
          </Flex>
        </Card>
      )}
    </Flex>
  );
};

export default AddBreakdown;
