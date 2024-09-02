import { useState } from 'react';
import { MdEdit, MdPhoto } from 'react-icons/md';

interface Props {
  url: string;
}

export const Avatar = ({ url }: Props) => {
  const [image, setImage] = useState<string | null>(url || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-48 h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
      {image ? (
        <img
          src={image}
          alt="Selected"
          className="object-cover w-full h-full rounded-lg shadow-md"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-gray-500">
          <MdPhoto className="text-4xl" />
          <span>No Image Selected</span>
        </div>
      )}
      <label className="absolute bottom-2 right-2 cursor-pointer bg-white p-2 rounded-full shadow-md">
        <MdEdit className="text-primary" />
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
      </label>
    </div>
  );
};
