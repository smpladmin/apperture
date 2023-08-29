import {
  Box,
  Button,
  Checkbox,
  CheckboxGroup,
  Flex,
  Text,
} from '@chakra-ui/react';
import { ChangeEvent, useEffect, useState } from 'react';

const CheckboxDropdown = ({
  data,
  onSubmit,
  values,
}: {
  data: string[];
  onSubmit: Function;
  values: string[];
}) => {
  const [selectedValues, setSelectedValues] = useState(values);
  const [isSelectAllChecked, setIsSelectAllChecked] = useState(false);

  useEffect(() => {
    if (selectedValues.length === data.length) {
      setIsSelectAllChecked(true);
    } else {
      setIsSelectAllChecked(false);
    }
  }, [selectedValues]);

  const handleAllSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setIsSelectAllChecked(true);
      setSelectedValues(data);
    } else {
      setIsSelectAllChecked(false);
      setSelectedValues([]);
    }
  };
  return (
    <Box
      w={'96'}
      position={'absolute'}
      zIndex={1}
      bg={'white.DEFAULT'}
      p={'2'}
      borderRadius={'12'}
      borderWidth={'1px'}
      borderColor={'white.200'}
      onPointerDown={(e) => e.stopPropagation()}
      maxHeight={'102'}
      overflow={'scroll'}
    >
      <Flex
        direction={'column'}
        gap={'3'}
        data-testid={'property-values-dropdown-container'}
      >
        <Box overflowY={'auto'} maxHeight={'70'}>
          <Checkbox
            colorScheme={'radioBlack'}
            px={'2'}
            py={'3'}
            w={'full'}
            isChecked={isSelectAllChecked}
            onChange={handleAllSelect}
            _hover={{
              bg: 'white.100',
            }}
            data-testid={'select-all-values'}
          >
            <Text
              fontSize={'xs-14'}
              lineHeight={'xs-14'}
              fontWeight={'500'}
              cursor={'pointer'}
              color={'black.500'}
              onPointerDown={(e) => e.stopPropagation()}
            >
              {'Select all'}
            </Text>
          </Checkbox>
          <CheckboxGroup
            value={selectedValues}
            onChange={(values: string[]) => {
              setSelectedValues(values);
            }}
          >
            {data.slice(0, 100).map((value: string) => {
              return (
                <Flex
                  as={'label'}
                  gap={'2'}
                  px={'2'}
                  py={'3'}
                  key={value}
                  _hover={{
                    bg: 'white.100',
                  }}
                  data-testid={'property-value-dropdown-option'}
                  borderRadius={'4'}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <Checkbox colorScheme={'radioBlack'} value={value}>
                    <Text
                      fontSize={'xs-14'}
                      lineHeight={'xs-14'}
                      fontWeight={'500'}
                      cursor={'pointer'}
                      color={'black.500'}
                      wordBreak={'break-word'}
                    >
                      {value}
                    </Text>
                  </Checkbox>
                </Flex>
              );
            })}
          </CheckboxGroup>
        </Box>
        <Button
          w="full"
          bg={'black.100'}
          color={'white.DEFAULT'}
          variant={'primary'}
          onClick={() => onSubmit(selectedValues)}
          data-testid={'add-event-property-values'}
          onPointerDown={(e) => e.stopPropagation()}
        >
          Add
        </Button>
      </Flex>
    </Box>
  );
};

export default CheckboxDropdown;
