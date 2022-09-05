import { Image, Flex, Box, Text, Button, Link } from '@chakra-ui/react';
import folder from '@assets/images/folder.svg';
import { relative } from 'path';
const Complete = () => {
  return (
    <Flex
      width={'full'}
      direction={'column'}
      justifyContent={'center'}
      alignItems={'center'}
      textAlign={'center'}
      position={'relative'}
    >
      <Image
        src={folder.src}
        paddingBottom={'10'}
        alt="Integration completed"
        width={'9.75rem'}
        height={'auto'}
      />
      <Box
        width={{ base: 'full', sm: 'xs' }}
        paddingX={{ base: '1rem', md: '0' }}
      >
        <Text
          fontWeight={'bold'}
          fontSize={'sh-28'}
          lineHeight={'sh-28'}
          marginBottom={'2'}
        >
          We are all set!
        </Text>
        <Text
          fontSize={{ base: 'xs-14', md: 'base' }}
          lineHeight={{ base: 'xs-14', md: 'base' }}
          color={'grey.200'}
        >
          “Zomato Mobile App” has been created and added to your applications.
        </Text>
        <Box
          w={'full'}
          mt={'12'}
          position={{ base: 'absolute', sm: 'relative' }}
          bottom={'0'}
          right={'0'}
          left={'0'}
          padding={{ base: '1rem', sm: '0' }}
        >
          <Button
            rounded={'lg'}
            bg={'black.100'}
            p={6}
            fontSize={{ base: 'xs-14', md: 'base' }}
            lineHeight={{ base: 'xs-14', md: 'base' }}
            fontWeight={'semibold'}
            textColor={'white.100'}
            w={'full'}
          >
            Explore
          </Button>
          <Link>
            <Text
              pt={'4'}
              decoration={'underline'}
              fontWeight={'500'}
              fontSize={'base'}
              lineHeight={'base'}
            >
              Go to Home
            </Text>
          </Link>
        </Box>
      </Box>
    </Flex>
  );
};

export default Complete;
