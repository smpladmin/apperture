// components/ToggleButton.tsx
import { Flex, Text, Box, useColorModeValue } from "@chakra-ui/react";
import { motion } from "framer-motion";

const MotionBox = motion(Box);

type ToggleButtonProps = {
  isTriggerBased: boolean;
  setIsTriggerBased: React.Dispatch<React.SetStateAction<boolean>>;
};

const ToggleButton: React.FC<ToggleButtonProps> = ({ isTriggerBased, setIsTriggerBased }) => {
  const toggleBg = "#EBEBEB";
  const activeBg = useColorModeValue("white", "gray.800");

  return (
    <Flex
      bg={toggleBg}
      borderRadius="30px"
      p="4px"
      w="200px"
      h="40px"
      alignItems="center"
      justifyContent="space-between"
      cursor="pointer"
      position="relative"
      mt="2"
      mb="2"
    >
      <MotionBox
        position="absolute"
        top="4px"
        left={isTriggerBased ? "50%" : "4px"}
        w="calc(50% - 8px)"
        h="32px"
        bg={activeBg}
        borderRadius="30px"
        layout
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
      <Box
        flex="1"
        textAlign="center"
        zIndex="1"
        onClick={() => setIsTriggerBased(false)}
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Text
          fontSize="xs"
          lineHeight="short"
          fontWeight="400"
          color="gray.900"
        >
          Time based
        </Text>
      </Box>
      <Box
        flex="1"
        textAlign="center"
        zIndex="1"
        onClick={() => setIsTriggerBased(true)}
        display="flex"
        alignItems="center"
        justifyContent="center"
        height="100%"
      >
        <Text
          fontSize="xs"
          lineHeight="short"
          fontWeight="400"
          color="gray.900"
        >
          Trigger based
        </Text>
      </Box>
    </Flex>
  );
};

export default ToggleButton;
