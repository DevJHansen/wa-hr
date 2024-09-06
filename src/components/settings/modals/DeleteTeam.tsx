import { useRecoilState } from 'recoil';
import { Modal } from '../../UI/Modal';
import { Button } from '../../UI/Button';
import { deleteTeamModal } from './recoil';
import { useState } from 'react';
import { handleTimeout } from '../../../utils/timeout';
import { companyState } from '../../../recoil/authState';
import { firestoreDB } from '../../../backend/firestore';
import { COMPANIES_COLLECTION } from '../../../constants/firebaseConstants';
import { doc, updateDoc } from 'firebase/firestore';
import { removeTeamFromEmployees } from '../../../backend/functions';

export const DeleteTeamModal = () => {
  const [modalState, setModalState] = useRecoilState(deleteTeamModal);
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
    setModalState({
      isOpen: false,
      team: '',
    });
  };

  const handleDelete = async () => {
    if (loading) {
      return;
    }

    setLoading(true);
    setError(false);
    setSuccess(false);

    try {
      const newTeams = company.teams.filter((team) => team !== modalState.team);

      const docRef = doc(firestoreDB, COMPANIES_COLLECTION, company.uid);
      await updateDoc(docRef, {
        teams: newTeams,
      });

      await removeTeamFromEmployees(modalState.team);

      setCompany({
        ...company,
        teams: newTeams,
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
      <Modal
        isOpen={modalState.isOpen}
        onClose={handleClose}
        title="Delete Team"
      >
        <div>
          <p>Are you sure you want to delete {modalState.team}?</p>
          <div className="flex items-center justify-end space-x-2 mt-6">
            {error && (
              <p className="text-error font-semibold mr-2">
                Error deleting team.
              </p>
            )}
            {success && (
              <p className="text-success font-semibold mr-2">Team deleted!</p>
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
