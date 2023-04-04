import React, { useState, useRef, ChangeEvent } from 'react';
import { Box, Button, Text } from '@chakra-ui/react';
import 'remixicon/fonts/remixicon.css';
import { useOnClickOutside } from '@lib/hooks/useOnClickOutside';
import SearchableCheckboxDropdown from '@components/SearchableDropdown/SearchableCheckboxDropdown';
import { SegmentProperty } from '@lib/domain/segment';

type EditColumnsProps = {
  eventProperties: SegmentProperty[];
  setSelectedColumns: Function;
  selectedColumns: string[];
};

const EditColumns = ({
  eventProperties,
  setSelectedColumns,
  selectedColumns,
}: EditColumnsProps) => {
  const [isColumnListOpen, setIsColumnListOpen] = useState(false);
  const [checkedValues, setCheckedValues] = useState<string[]>([
    ...selectedColumns,
  ]);
  const [allValuesSelected, setAllValuesSelected] = useState(false);
  const [loadingPropertyValues, setLoadingPropertyValues] = useState(false);

  const eventValueRef = useRef(null);
  useOnClickOutside(eventValueRef, () => setIsColumnListOpen(false));

  const handleSelectValues = () => {
    setIsColumnListOpen(false);

    setSelectedColumns([...new Set(['user_id', ...checkedValues])]);
  };

  const handleAllSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (checked) {
      setAllValuesSelected(true);
      setCheckedValues(eventProperties.map((property) => property.id));
    } else {
      setAllValuesSelected(false);
      setCheckedValues([]);
    }
  };

  const handleCheckboxChange = (values: string[]) => {
    setAllValuesSelected(false);
    setCheckedValues(values);
  };

  return (
    <>
      <Box position={'relative'} ref={eventValueRef}>
        <Button
          onClick={() => setIsColumnListOpen(true)}
          bg={'none'}
          fontSize={'sh-14'}
          fontWeight={500}
          gap={2}
          _hover={{
            bg: 'white.100',
          }}
          data-testid={'edit-column'}
        >
          <i className="ri-pencil-fill"></i>
          <Text fontSize={'xs-14'} fontWeight={500}>
            Edit Columns
          </Text>
        </Button>
        <SearchableCheckboxDropdown
          dropdownPosition={'right'}
          isOpen={isColumnListOpen}
          isLoading={loadingPropertyValues}
          data={eventProperties}
          onSubmit={handleSelectValues}
          onAllSelect={handleAllSelect}
          onSelect={handleCheckboxChange}
          isSelectAllChecked={allValuesSelected}
          selectedValues={checkedValues}
          listKey={'id'}
          width={'96'}
        />
      </Box>
    </>
  );
};
export default EditColumns;
