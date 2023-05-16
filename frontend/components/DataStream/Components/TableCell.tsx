import { Text, StyleProps } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

const TableCell = ({
  children,
  ...styleProps
}: PropsWithChildren<StyleProps>) => {
  return (
    <Text
      as={'span'}
      fontWeight={400}
      fontSize={'xs-14'}
      lineHeight={'xs-22'}
      {...styleProps}
    >
      {children}
    </Text>
  );
};

export default TableCell;
