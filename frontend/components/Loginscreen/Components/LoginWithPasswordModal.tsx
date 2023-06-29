import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import { BACKEND_BASE_URL } from 'config';

const LoginWithPasswordModal = ({
  isOpen = true,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const redirectionRef = useRef<any>();

  const handleEmail = (e: any) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e: any) => {
    setPassword(e.target.value);
  };

  const handleLogin = (e: any) => {
    e.preventDefault();
    if (email && password) redirectionRef.current.click();
  };

  return (
    <>
      <a
        ref={redirectionRef}
        href={`${BACKEND_BASE_URL}/login/password?email=${email}&password=${password}`}
      ></a>
      <Modal
        isCentered
        motionPreset="slideInBottom"
        isOpen={isOpen}
        onClose={onClose}
      >
        <ModalOverlay backdropFilter={'blur(10px)'} bg={'grey.0'} />
        <ModalContent>
          <ModalHeader></ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <form id="login-form" onSubmit={handleLogin}>
              <FormControl>
                <Flex gap={2} direction="column" pt={5}>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    placeholder="John@doe.com"
                    onChange={handleEmail}
                  />
                  <FormLabel mt={2}>Password</FormLabel>
                  <Input
                    type="password"
                    placeholder="xxxxxxxxxxxx"
                    onChange={handlePassword}
                  />
                </Flex>
              </FormControl>
            </form>
          </ModalBody>
          <ModalFooter>
            <Button
              borderWidth={'1px'}
              type={'submit'}
              form={'login-form'}
              variant={'secondary'}
            >
              Log In
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LoginWithPasswordModal;
