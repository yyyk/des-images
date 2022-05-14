import { ChangeEvent, useState } from 'react';
import { defaultTokenData } from 'src/shared/constants';

interface DateInputProps {
  showLabel?: boolean;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

const DateInput = ({ showLabel = true, defaultValue, onChange }: DateInputProps) => {
  const [date, setDate] = useState(
    defaultValue ?? `${defaultTokenData.year}-${defaultTokenData.month}-${defaultTokenData.day}`,
  );

  const maxDate = `${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}-${String(
    new Date().getUTCDate(),
  ).padStart(2, '0')}`;

  const handleOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    const date = e.target.value;
    setDate(date);
    onChange && onChange(date);
  };

  return (
    <>
      {showLabel && (
        <label className="label" htmlFor="">
          <span className="label-text">choose a date</span>
        </label>
      )}
      <input
        className="input input-bordered w-full"
        type="date"
        name=""
        id=""
        value={date}
        min="2020-01-01"
        max={maxDate}
        onChange={handleOnChange}
      />
    </>
  );
};

export default DateInput;
