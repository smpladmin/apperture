import { Box, Button, Flex, Text } from '@chakra-ui/react';
import EventFields from '../components/EventFields';
import { ConversionWindowObj, FunnelStep } from '@lib/domain/funnel';
import { CaretDown, Plus } from '@phosphor-icons/react';
import ConversionCriteria from '../components/ConversionCriteria';
import { stepsSequence } from '../util';
import Dropdown from '@components/SearchableDropdown/Dropdown';
import { useRef, useState } from 'react';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';

type CreateFunnelActionProps = {
  funnelSteps: FunnelStep[];
  setFunnelSteps: Function;
  setIsStepAdded: Function;
  conversionWindow: ConversionWindowObj;
  setConversionWindow: Function;
  randomSequence: boolean;
  setRandomSequence: Function;
};

const CreateFunnelAction = ({
  funnelSteps,
  setFunnelSteps,
  setIsStepAdded,
  conversionWindow,
  setConversionWindow,
  randomSequence,
  setRandomSequence,
}: CreateFunnelActionProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const sequenceRef = useRef(null);

  const handleAddNewStep = () => {
    const newField = { event: '', filters: [] };
    setFunnelSteps([...funnelSteps, newField]);
    setIsStepAdded(true);
  };

  useOnClickOutside(sequenceRef, () => setIsDropdownOpen(false));

  return (
    <Flex direction={'column'} gap={'3'} w={'full'}>
      <Flex px={2} justifyContent={'space-between'} alignItems={'center'}>
        <Flex gap={2} alignItems={'center'}>
          <Text
            color={'grey.500'}
            fontSize={{ base: 'xs-10', md: 'xs-12' }}
            lineHeight={{ base: 'xs-10', md: 'xs-12' }}
            fontWeight={'400'}
          >
            Steps
          </Text>
          <Box position={'relative'} ref={sequenceRef}>
            <Flex
              alignItems={'center'}
              py={'1'}
              px={'3'}
              border={'1px'}
              borderColor={'white.200'}
              borderRadius={'100'}
              gap={'1'}
              onClick={() => {
                setIsDropdownOpen(true);
              }}
              cursor={'pointer'}
              bg={isDropdownOpen ? 'white.400' : 'white.DEFAULT'}
              _hover={{ bg: 'white.400' }}
            >
              <Text
                color={'grey.500'}
                fontSize={{ base: 'xs-10', md: 'xs-12' }}
                lineHeight={{ base: 'xs-10', md: 'xs-12' }}
                fontWeight={'400'}
              >
                {randomSequence ? 'Any order' : 'In sequence'}
              </Text>
              <CaretDown size={14} color={'#747474'} />
            </Flex>
            <Dropdown isOpen={isDropdownOpen} minWidth={'70'}>
              {stepsSequence.map((seq) => {
                return (
                  <Flex direction={'column'}>
                    <Flex
                      p={'2'}
                      _hover={{ bg: 'white.400' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setRandomSequence(seq.value);
                        setIsDropdownOpen(false);
                      }}
                      borderRadius={'4'}
                    >
                      <Text
                        fontSize={'xs-14'}
                        lineHeight={'lh-135'}
                        fontWeight={'500'}
                      >
                        {seq.label}
                      </Text>
                    </Flex>
                  </Flex>
                );
              })}
            </Dropdown>
          </Box>
        </Flex>
        <Button
          h={5.5}
          minW={5.5}
          w={5.5}
          p={0}
          data-testid={'add-button'}
          onClick={handleAddNewStep}
          cursor={'pointer'}
          variant={'secondary'}
        >
          <Plus size={14} color={'#000000'} weight={'bold'} />
        </Button>
      </Flex>
      <EventFields funnelSteps={funnelSteps} setFunnelSteps={setFunnelSteps} />
      <ConversionCriteria
        conversionWindow={conversionWindow}
        setConversionWindow={setConversionWindow}
      />
    </Flex>
  );
};

export default CreateFunnelAction;
