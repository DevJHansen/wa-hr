import { useRecoilState } from 'recoil';
import { companyState } from '../../recoil/authState';
import { Button } from '../UI/Button';
import { FormEvent, useState } from 'react';
import { FormInput } from '../UI/FormInput';
import { handleTimeout } from '../../utils/timout';
import { doc, updateDoc } from 'firebase/firestore';
import { COMPANIES_COLLECTION } from '../../constants/firebaseConstants';
import { firestoreDB } from '../../backend/firestore';
import { Avatar } from '../UI/Avatar';

export const CompanyInfo = () => {
  const [company, setCompany] = useRecoilState(companyState);
  const [name, setName] = useState(company?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  if (!company) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);

    const changes = {
      name,
      updatedAt: Date.now(),
    };

    try {
      const docRef = doc(firestoreDB, COMPANIES_COLLECTION, company.uid);
      updateDoc(docRef, changes);

      setCompany({
        ...company,
        ...changes,
      });
      setSaving(false);
      setSuccess(true);
      handleTimeout(() => setSuccess(false));
    } catch (error) {
      console.error(error);
      setSaving(false);
      setError(true);
      handleTimeout(() => setError(false));
    }
  };

  const handleCancel = () => {
    setName('');
  };

  const hasChanges = name !== company.name;

  return (
    <div className="w-full">
      <div className="border-b-[1px] border-b-gray-300 pb-8">
        <h1 className="font-bold text-lg">Company Info</h1>
        <form className="mt-6" onSubmit={handleSubmit}>
          <Avatar url={company.logo} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-8">
            <FormInput
              label="Company Name"
              type="text"
              placeholder="E.g. Abc Inc."
              id="companyName"
              required
              value={name}
              onChange={(value) => setName(value)}
            />
          </div>
          <div className="flex mt-4 justify-end items-center">
            {success && (
              <p className="mr-4 text-success font-semibold">Info updated!</p>
            )}
            {error && (
              <p className="mr-4 text-error font-semibold">
                Failed to save changes.
              </p>
            )}
            <Button
              text="Cancel"
              onClick={handleCancel}
              outline={true}
              className="mr-2"
            />
            <Button
              text="Save"
              disabled={!hasChanges}
              loading={saving}
              type={hasChanges ? 'submit' : undefined}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
