import { FormEvent, useState } from 'react';
import { useRecoilState } from 'recoil';
import { companyState } from '../../recoil/authState';
import { Button } from '../UI/Button';
import { FormInput } from '../UI/FormInput';
import { Label } from '../UI/Label';
import { deleteTeamModal } from './modals/recoil';
import { doc, updateDoc } from 'firebase/firestore';
import { firestoreDB } from '../../backend/firestore';
import { COMPANIES_COLLECTION } from '../../constants/firebaseConstants';
import { handleTimeout } from '../../utils/timeout';

export const Teams = () => {
  const [, setModalState] = useRecoilState(deleteTeamModal);
  const [company, setCompany] = useRecoilState(companyState);
  const [team, setTeam] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!company) {
    return;
  }

  const handleCancel = () => {
    setTeam('');
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving || !team) {
      return;
    }

    setSaving(true);
    setSuccess(false);
    setError(false);

    try {
      const docRef = doc(firestoreDB, COMPANIES_COLLECTION, company.uid);
      await updateDoc(docRef, {
        teams: [...company.teams, team],
      });

      setCompany({
        ...company,
        teams: [...company.teams, team],
      });

      setSaving(false);
      setSuccess(true);
      setTeam('');
      handleTimeout(() => setSuccess(false));
    } catch (error) {
      console.error(error);
      setSaving(false);
      setError(true);
      handleTimeout(() => setError(false));
    }
  };

  const startDeleteTeam = (team: string) => {
    setModalState({
      isOpen: true,
      team,
    });
  };

  return (
    <div className="w-full">
      <div className="border-b-[1px] border-b-gray-300 pb-8">
        <h1 className="font-bold text-lg">Teams</h1>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormInput
              label="New Team"
              type="text"
              placeholder="E.g. Marketing"
              id="team"
              required
              value={team}
              onChange={(value) => setTeam(value)}
            />
          </div>
          <div className="flex items-center flex-wrap pb-2">
            {company.teams.map((dep, i) => (
              <Label
                key={i}
                text={dep}
                type="info"
                classes="mr-2 mt-2"
                handleClick={() => startDeleteTeam(dep)}
              />
            ))}
          </div>
          <div className="flex mt-4 justify-end items-center">
            {error && (
              <p className="mr-4 text-error font-semibold">
                Failed to save changes.
              </p>
            )}
            {success && (
              <p className="mr-4 text-success font-semibold">Team saved!</p>
            )}
            <Button
              text="Cancel"
              onClick={handleCancel}
              outline={true}
              className="mr-2"
            />
            <Button
              text="Save"
              disabled={!team || company.teams.includes(team)}
              loading={saving}
              type={
                team && !company.teams.includes(team) ? 'submit' : undefined
              }
            />
          </div>
        </form>
      </div>
    </div>
  );
};
