import { Flex, IconButton, Text } from '@chakra-ui/react';
import { ReactElement } from 'react';

type MobileSidemenuOptionProps = {
  menuOption: {
    label: string;
    icon: ReactElement;
  };
  onMenuClick?: Function;
};
const MobileSidemenuOption = ({
  menuOption: { label, icon },
  onMenuClick,
}: MobileSidemenuOptionProps) => {
  return (
    <Flex
      width={'full'}
      height={'13'}
      borderRadius={'3'}
      justifyContent={'flex-start'}
      alignItems={'center'}
      gap={'3'}
      p={'4'}
      _hover={{
        backgroundColor: 'white.100',
        fontWeight: '500',
        cursor: 'pointer',
      }}
      onClick={() => onMenuClick?.()}
    >
      <IconButton
        aria-label="map"
        icon={icon}
        minWidth={'auto'}
        bg={'transparent'}
      />
      <Text fontSize={'base'} lineHeight={'base'} fontWeight={'400'}>
        {label}
      </Text>
    </Flex>
  );
};

export default MobileSidemenuOption;
