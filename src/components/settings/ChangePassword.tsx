import { useRecoilState } from 'recoil';
import { userState } from '../../recoil/authState';
import { Button } from '../UI/Button';
import { FormEvent, useState } from 'react';
import { FormInput } from '../UI/FormInput';
import { handleTimeout } from '../../utils/timout';
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
} from 'firebase/auth';
import { auth } from '../../backend/firebase';

export const ChangePassword = () => {
  const [user] = useRecoilState(userState);
  const [currPassword, setCurrPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  if (!user) return null;

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    const user = auth.currentUser;

    if (!user || !user.email) {
      return;
    }

    setSaving(true);

    try {
      const credential = EmailAuthProvider.credential(user.email, currPassword);
      await reauthenticateWithCredential(user, credential);

      await updatePassword(user, newPassword);

      setSaving(false);
      setSuccess(true);
      setCurrPassword('');
      setNewPassword('');
      setConfirmPassword('');
      handleTimeout(() => setSuccess(false));
    } catch (error) {
      console.error(error);
      setSaving(false);
      setError(true);
      handleTimeout(() => setError(false));
    }
  };

  const handleCancel = () => {
    setCurrPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const areEqual = newPassword === confirmPassword;

  return (
    <div className="w-full">
      <div className="border-b-[1px] border-b-gray-300 pb-8">
        <h1 className="font-bold text-lg">Change Password</h1>
        <form className="mt-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <FormInput
              label="Current Password"
              type="password"
              placeholder="******"
              id="password"
              required
              value={currPassword}
              onChange={(value) => setCurrPassword(value)}
            />
            <FormInput
              label="New Password"
              type="password"
              placeholder="******"
              id="password"
              required
              value={newPassword}
              onChange={(value) => setNewPassword(value)}
            />
            <FormInput
              label="Confirm Password"
              type="password"
              placeholder="******"
              id="confirm"
              required
              value={confirmPassword}
              onChange={(value) => setConfirmPassword(value)}
            />
          </div>
          <div className="flex mt-4 justify-end items-center">
            {success && (
              <p className="mr-4 text-success font-semibold">
                Password updated!
              </p>
            )}
            {error && (
              <p className="mr-4 text-error font-semibold">
                Failed to update password.
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
              disabled={!areEqual || !currPassword}
              loading={saving}
              type={areEqual ? 'submit' : undefined}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
