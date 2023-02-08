import {
  Button,
  Flex,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
} from '@chakra-ui/react';
import React, { useState } from 'react';
import Image from 'next/image';

const LoginWithPasswordModal = ({
  isOpen = true,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleEmail = (e: any) => {
    setEmail(e.target.value);
  };
  const handlePassword = (e: any) => {
    setPassword(e.target.value);
  };
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Login</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form id="login-form" onSubmit={handleLogin}>
            <FormControl>
              <Flex gap={2} direction="column">
                <Input type="email" placeholder="Email" />
                <Input type="password" placeholder="Password" />
              </Flex>
            </FormControl>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button type={'submit'} form={'login-form'} variant={'secondary'}>
            Log In
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default LoginWithPasswordModal;
