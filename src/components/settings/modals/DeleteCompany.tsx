import { useRecoilState } from 'recoil';
import { Modal } from '../../UI/Modal';
import { Button } from '../../UI/Button';
import { deleteCompanyModal } from './recoil';
import { useState } from 'react';
import { handleTimeout } from '../../../utils/timeout';
import { companyState } from '../../../recoil/authState';
import { firestoreDB } from '../../../backend/firestore';
import { COMPANIES_COLLECTION } from '../../../constants/firebaseConstants';
import { doc, updateDoc } from 'firebase/firestore';

export const DeleteCompanyModal = () => {
  const [modalState, setModalState] = useRecoilState(deleteCompanyModal);
  const [company, setCompany] = useRecoilState(companyState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!company) {
    return;
  }

  const handleClose = () => {
    setError(false);
    setSuccess(false);
    setLoading(false);
    setModalState(false);
  };

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      // TODO: We have to cancel their subscription as well
      const docRef = doc(firestoreDB, COMPANIES_COLLECTION, company.uid);
      await updateDoc(docRef, {
        deleted: true,
      });

      setCompany({
        ...company,
        deleted: true,
      });

      setLoading(false);
      setSuccess(true);
      handleTimeout(() => handleClose());
    } catch (error) {
      console.error(error);
      setLoading(false);
      handleTimeout(() => setError(false));
    }
  };

  return (
    <>
      <Modal isOpen={modalState} onClose={handleClose} title="Delete Company">
        <div>
          <p>Are you sure you want to delete this company?</p>
          <div className="flex items-center justify-end space-x-2 mt-6">
            {error && (
              <p className="text-error font-semibold mr-2">
                Error deleting company.
              </p>
            )}
            {success && (
              <p className="text-success font-semibold mr-2">
                Department deleted!
              </p>
            )}
            <Button onClick={handleClose} text="Cancel" outline={true} />
            <Button
              onClick={handleDelete}
              text="Delete"
              severity="danger"
              loading={loading}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
