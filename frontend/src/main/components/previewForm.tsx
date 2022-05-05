import { FormEvent, useState } from 'react';
import { defaultTokenData } from 'src/shared/constants';
import { PreviewFormData } from 'src/shared/interfaces';
import { destructDateInputValue } from 'src/shared/utils/destructDateInputValue';

interface PreviewFormProps {
  onSubmit: ({ year, month, day }: PreviewFormData) => void;
}

const PreviewForm = ({ onSubmit }: PreviewFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    `${defaultTokenData.year}-${defaultTokenData.month}-${defaultTokenData.day}`,
  );

  const handleOnPreview = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onSubmit(destructDateInputValue(selectedDate));
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleOnPreview} className="flex justify-start items-end w-2/3 mx-auto">
      <div className="grow">
        {/* TODO: separate component */}
        <label className="label" htmlFor="">
          <span className="label-text">choose a date</span>
        </label>
        <input
          className="input input-bordered w-full max-w-xs"
          type="date"
          name=""
          id=""
          value={selectedDate}
          min="2020-01-01"
          max={`${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}-${String(
            new Date().getUTCDate(),
          ).padStart(2, '0')}`}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>
      <button className="btn ml-4" type="submit" disabled={isLoading}>
        Preview
      </button>
    </form>
  );
};

export default PreviewForm;
