import 'remixicon/fonts/remixicon.css';
import gaIcon from '@assets/images/ga-icon.png';
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Stack,
  Checkbox,
  Text,
  Image,
} from '@chakra-ui/react';

const SelectDataSources = () => {
  return (
    <Flex
      h={{ base: '100%', lg: 'auto' }}
      flexDir={'column'}
      p={4}
      px={{ lg: 48 }}
      pt={{ lg: 20 }}
      maxW={{ lg: '1280px' }}
    >
      <Box>
        <IconButton
          aria-label="close"
          icon={<i className="ri-close-fill" />}
          rounded={'full'}
          bg={'white'}
          border={'1px'}
          borderColor={'white.200'}
        />
        <Box mt={11} w={{ sm: 'full' }} maxW={{ lg: '50rem' }}>
          <Image
            src={gaIcon.src}
            alt="Integration completed"
            width={{ base: '52px', md: '18' }}
            height={{ base: '52px', md: '18' }}
          ></Image>
          <Text
            textColor={'grey.200'}
            paddingY={6}
            fontSize={'xs-14'}
            lineHeight={'xs-14'}
            fontWeight={'medium'}
          >
            Step 3 of 3
          </Text>
          <Heading
            as={'h2'}
            fontWeight={'600'}
            pb={{ base: 8, lg: 10 }}
            fontSize={{ base: '1.74rem', lg: '3.5rem' }}
            lineHeight={{ base: '2.125rem', lg: '4.125rem' }}
          >
            Select applications from Google Analytics that you want to track
          </Heading>
        </Box>
        <Stack width={'full'} maxW={'31.25rem'} spacing={'6'}>
          <Checkbox
            gap={'14.5px'}
            paddingY={4}
            paddingX={3}
            borderWidth={'1px'}
            borderRadius={'12px'}
            bgColor={'white.Default'}
            borderColor={'white.200'}
            _checked={{
              backgroundColor: 'white.100',
              borderColor: 'black',
              fontWeight: '500',
              cursor: 'pointer',
            }}
          >
            <Box>
              <Text lineHeight={'base'} fontSize={'base'} fontWeight={'500'}>
                Zomato Delivery
              </Text>
              <Flex justifyContent={'space-between'} mt={'0.375rem'}>
                <Text
                  lineHeight={'xs-12'}
                  fontSize={'xs-12'}
                  fontWeight={'400'}
                  color={'grey.200'}
                  width={'40'}
                >
                  UA-3456789
                </Text>
                <Text
                  lineHeight={'xs-12'}
                  fontSize={'xs-12'}
                  fontWeight={'400'}
                  color={'grey.200'}
                >
                  GA 3
                </Text>
              </Flex>
            </Box>
          </Checkbox>
        </Stack>
      </Box>
      <Flex gap={'2'} mt={'10'} w={'full'}>
        <IconButton
          aria-label="back"
          icon={<i className="ri-arrow-left-line"></i>}
          rounded={'lg'}
          bg={'white.100'}
          p={6}
          w={'3.375rem'}
          h={'3.375rem'}
          // onClick={handleGoBack}
        />
        <Button
          rounded={'lg'}
          bg={'black.100'}
          p={6}
          fontSize={'base'}
          fontWeight={'semibold'}
          lineHeight={'base'}
          textColor={'white.100'}
          width={{ base: 'full', md: '72' }}
          h={'3.375rem'}
        >
          Next
        </Button>
      </Flex>
    </Flex>
  );
};

export default SelectDataSources;
