import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/authState';
import { Button } from '../UI/Button';
import { FormEvent, useState } from 'react';
import { FormInput } from '../UI/FormInput';
import { handleTimeout } from '../../utils/timout';
import { doc, updateDoc } from 'firebase/firestore';
import { USERS_COLLECTION } from '../../constants/firebaseConstants';
import { firestoreDB } from '../../backend/firestore';

export const BasicInfo = () => {
  const [user, setUser] = useRecoilState(userState);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [surname, setSurname] = useState(user?.surname ?? '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  if (!user) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);

    const changes = {
      firstName,
      surname,
      updatedAt: Date.now(),
    };

    try {
      const docRef = doc(firestoreDB, USERS_COLLECTION, user.uid);
      updateDoc(docRef, changes);

      setUser({
        ...user,
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
    setFirstName(user.firstName);
    setSurname(user.surname);
  };

  const hasChanges = firstName !== user.firstName || surname !== user.surname;

  return (
    <div className="w-full">
      <div className="border-b-[1px] border-b-gray-300 pb-8">
        <h1 className="font-bold text-lg">Basic Info</h1>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <FormInput
              label="First Name"
              type="text"
              placeholder="E.g. John"
              id="firstName"
              required
              value={firstName}
              onChange={(value) => setFirstName(value)}
            />
            <FormInput
              label="Surname"
              type="text"
              placeholder="E.g. Doe"
              id="surname"
              required
              value={surname}
              onChange={(value) => setSurname(value)}
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
