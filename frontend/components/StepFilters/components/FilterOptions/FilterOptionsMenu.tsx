import { Box, Flex, Text } from '@chakra-ui/react';
import { FilterDataType } from '@lib/domain/common';
import { FilterOptionMenuType } from '@lib/domain/segment';
import React, { useState } from 'react';

type FilterOptionMenuProps = {
  menu: FilterOptionMenuType;
  onSubmit: Function;
  datatype: FilterDataType;
  filterIndex: number;
};

const FilterOptiosMenu = ({
  menu,
  onSubmit,
  datatype,
  filterIndex,
}: FilterOptionMenuProps) => {
  const isSelected = datatype === menu.label;
  const [showSubmenu, setShowSubmenu] = useState(false);

  const handleSubmit = (item: FilterOptionMenuType) => {
    if (item.submenu.length > 0) return;
    setShowSubmenu(false);
    onSubmit(filterIndex, item.label);
  };

  return (
    <Box
      onMouseEnter={(e) => {
        setShowSubmenu(true);
      }}
      onMouseLeave={() => {
        setShowSubmenu(false);
      }}
      onClick={(event) => {
        event.stopPropagation();
        handleSubmit(menu);
      }}
      position={'relative'}
      data-testid={'dropdown-item'}
    >
      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        _hover={{ bg: 'white.400', cursor: 'pointer' }}
        px={2}
        py={3}
        bg={isSelected ? 'white.400' : ''}
        borderRadius={'4'}
      >
        <Text
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'500'}
          cursor={'pointer'}
          minWidth={'20'}
        >
          {menu.label}
        </Text>
        {menu.submenu?.length ? (
          <i className="ri-arrow-right-s-line"></i>
        ) : null}
      </Flex>
      {menu.submenu?.length && showSubmenu ? (
        <Box
          top={'0'}
          left={'100%'}
          position={'absolute'}
          zIndex={1}
          borderRadius={'8'}
          p={'2'}
          borderWidth={'1px'}
          borderColor={'white.200'}
          bg={'white.DEFAULT'}
          w={'76'}
        >
          {menu.submenu.map((submenu: FilterOptionMenuType) => (
            <FilterOptiosMenu
              menu={submenu}
              key={submenu.id}
              datatype={datatype}
              onSubmit={onSubmit}
              filterIndex={filterIndex}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default FilterOptiosMenu;
