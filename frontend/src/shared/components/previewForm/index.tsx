import { FormEvent, useState } from 'react';
import { defaultTokenData } from 'src/shared/constants';
import { PreviewFormData } from 'src/shared/interfaces';
import { destructDateInputValue } from 'src/shared/utils/formHelpers';
import DateInput from 'src/shared/components/dateInput';

interface PreviewFormProps {
  defaultValue?: string;
  onSubmit: ({ year, month, day }: PreviewFormData) => void;
}

const PreviewForm = ({
  defaultValue = `${defaultTokenData.year}-${defaultTokenData.month}-${defaultTokenData.day}`,
  onSubmit,
}: PreviewFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [date, setDate] = useState<string>(defaultValue);

  const handleOnPreview = (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    onSubmit(destructDateInputValue(date));
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleOnPreview} className="flex justify-start items-end">
      <div className="grow">
        <DateInput
          classNames="relative rounded-r-none border-r-0 focus:border-r focus:z-10"
          defaultValue={defaultValue}
          onChange={(value) => setDate(value)}
        />
      </div>
      <button
        className={`relative btn rounded-l-none ${isLoading ? 'loading' : ''}`}
        type="submit"
        disabled={isLoading}
      >
        Preview
      </button>
    </form>
  );
};

export default PreviewForm;
