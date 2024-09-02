import { Button } from '../UI/Button';

export const Danger = () => {
  return (
    <div className="w-full">
      <div className="border-b-[1px] border-b-gray-300 pb-8">
        <h1 className="font-bold text-lg text-error">Danger</h1>
        <div className="flex mt-6">
          <Button
            text="Cancel Plan"
            className="mr-2 mb-2 border-error text-error"
            outline={true}
          />
          <Button
            text="Delete Company"
            className="border-error text-error mb-2"
            outline={true}
          />
        </div>
      </div>
    </div>
  );
};
