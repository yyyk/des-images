import { ChangeEvent, useRef, useState } from 'react';
import { defaultTokenData } from 'src/shared/constants';

interface DateInputProps {
  showLabel?: boolean;
  defaultValue?: string;
  classNames?: string;
  onChange?: (value: string) => void;
}

const DEFAULT_MIN_DATE = '2020-01-01';

const DateInput = ({ showLabel = true, defaultValue, classNames = '', onChange }: DateInputProps) => {
  const [date, setDate] = useState(
    defaultValue ?? `${defaultTokenData.year}-${defaultTokenData.month}-${defaultTokenData.day}`,
  );
  const dateObj = new Date();
  const maxDate = `${dateObj.getUTCFullYear()}-${String(dateObj.getUTCMonth() + 1).padStart(2, '0')}-${String(
    dateObj.getUTCDate(),
  ).padStart(2, '0')}`;
  const dateInputRef = useRef<HTMLInputElement>(null);

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
      <div className="relative">
        <input
          className={`input input-bordered w-full${classNames && ` ${classNames}`}`}
          type="text"
          name=""
          id=""
          readOnly
          value={date}
          onClick={() => dateInputRef?.current?.focus()}
        />
        <input
          ref={dateInputRef}
          className="absolute top-0 right-0 bottom-0 left-0 opacity-0"
          type="date"
          name=""
          id=""
          value={date}
          min={DEFAULT_MIN_DATE}
          max={maxDate}
          onChange={handleOnChange}
        />
      </div>
    </>
  );
};

export default DateInput;
