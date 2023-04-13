import { Box, Flex, Text } from '@chakra-ui/react';
import Card from '@components/Card';
import SearchableListDropdown from '@components/SearchableDropdown/SearchableListDropdown';
import React from 'react';

const SelectEventsRetention = () => {
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
                A
              </Flex>
              <Box position="relative" w={'full'} borderRadius={'4'}>
                <Text
                  color={false ? 'black.DEFAULT' : 'grey.600'}
                  fontSize={'xs-14'}
                  fontWeight={false ? 500 : 400}
                  p={'1'}
                  _hover={{ background: 'white.400', cursor: 'pointer' }}
                  lineHeight={'xs-14'}
                  onClick={() => {}}
                >
                  {false || 'Select  Event'}
                </Text>
                <SearchableListDropdown
                  isOpen={false}
                  isLoading={false}
                  data={[]}
                  onSubmit={() => {}}
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
