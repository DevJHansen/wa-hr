import { useRecoilState } from 'recoil';
import { companyState } from '../../recoil/authState';
import { Button } from '../UI/Button';
import { FormEvent, useEffect, useState } from 'react';
import { FormInput } from '../UI/FormInput';
import { handleTimeout } from '../../utils/timeout';
import { doc, updateDoc } from 'firebase/firestore';
import { COMPANIES_COLLECTION } from '../../constants/firebaseConstants';
import { firestoreDB } from '../../backend/firestore';
import { Avatar } from '../UI/Avatar';
import { base64ToFile, uploadFile } from '../../backend/storage';

export const CompanyInfo = () => {
  const [company, setCompany] = useRecoilState(companyState);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);
  const [logo, setLogo] = useState<string>('');

  useEffect(() => {
    if (!name && company?.name) {
      setName(company.name);
    }
    if (!logo && company?.logo) {
      setLogo(company.logo);
    }
  }, [company, logo, name]);

  if (!company) return null;

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (saving) {
      return;
    }

    setSaving(true);

    let logoUrl = company.logo;

    try {
      if (company.logo !== logo) {
        const file = base64ToFile(logo, 'logo');
        const res = await uploadFile(`/${company.uid}/logo`, file);

        if (!res.link) {
          throw new Error('Error uploading file');
        }

        logoUrl = res.link;
      }

      const docRef = doc(firestoreDB, COMPANIES_COLLECTION, company.uid);
      await updateDoc(docRef, {
        name,
        updatedAt: Date.now(),
        logo: logoUrl,
      });

      setCompany({
        ...company,
        name,
        updatedAt: Date.now(),
        logo: logoUrl,
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
    setName(company.name);
    setLogo(company.logo);
  };

  const hasChanges = name !== company.name || company.logo !== logo;

  return (
    <div className="w-full">
      <div className=" pb-8">
        <h1 className="font-bold text-lg">Company Info</h1>
        <form className="mt-6" onSubmit={handleSubmit}>
          <Avatar url={logo} handleChange={handleImageChange} />
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
