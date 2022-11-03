import ConfirmationModal from '@components/ConfirmationModal';
import { BACKEND_BASE_URL } from 'config';

type LogoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      headerText={'Log Out'}
      bodyText={'Are your sure you want to log out of Apperture?'}
      primaryButtonText={'Log Out'}
      primaryButtonLink={`${BACKEND_BASE_URL}/logout`}
    />
  );
};

export default LogoutModal;
