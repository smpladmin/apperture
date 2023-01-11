import { Box, Flex, Text } from '@chakra-ui/react';
import {
  FilterOptionMenuType,
  SegmentFilterDataType,
} from '@lib/domain/segment';
import React, { useState } from 'react';

type FilterOptionMenuProps = {
  menu: FilterOptionMenuType;
  onSubmit: Function;
  datatype: SegmentFilterDataType;
};

const FilterOptionMenu = ({
  menu,
  onSubmit,
  datatype,
}: FilterOptionMenuProps) => {
  const isSelected = datatype === menu.label;
  const [showSubmenu, setShowSubmenu] = useState(false);

  const handleSubmit = (item: FilterOptionMenuType) => {
    if (item.submenu.length > 0) return;
    setShowSubmenu(false);
    onSubmit(item);
  };

  return (
    <Box
      onMouseEnter={() => {
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
    >
      <Flex
        alignItems={'center'}
        justifyContent={'space-between'}
        _hover={{ bg: 'white.100', cursor: 'pointer' }}
        px={6}
        py={3}
        bg={showSubmenu || isSelected ? 'white.100' : ''}
      >
        <Text
          fontSize={'xs-14'}
          lineHeight={'xs-14'}
          fontWeight={'600'}
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
          position={'absolute'}
          left={'100%'}
          zIndex={2}
          p={'3'}
          borderRadius={'12'}
          borderWidth={'0.4px'}
          borderColor={'grey.100'}
          bg={'white.DEFAULT'}
          shadow={'0px 0px 4px rgba(0, 0, 0, 0.12)'}
          top={'0'}
        >
          {menu.submenu.map((submenu: FilterOptionMenuType) => (
            <FilterOptionMenu
              menu={submenu}
              key={submenu.id}
              datatype={datatype}
              onSubmit={onSubmit}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
};

export default FilterOptionMenu;
