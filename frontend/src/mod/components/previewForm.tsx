import { ChangeEvent, FormEvent, useState } from 'react';
import { isValidPlaintext } from 'src/shared/utils/des';
import { latin1Table } from 'src/shared/utils/latin1Table';
import {
  CIPHERTEXT_LENGTH,
  DEFAULT_CIPHERTEXT,
  DEFAULT_DATE,
  DEFAULT_PLAINTEXT,
  PLAINTEXT_LENGTH,
} from 'src/mod/constants';
import { TextType } from 'src/mod/interfaces';
import { destructDateInputValue } from 'src/shared/utils/destructDateInputValue';
import { PreviewFormData } from 'src/shared/interfaces';

interface PreviewFormProps {
  onSubmit: ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => void;
}

const PreviewForm = ({ onSubmit }: PreviewFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState({
    plaintext: DEFAULT_PLAINTEXT,
    ciphertext: DEFAULT_CIPHERTEXT,
  });
  const [date, setDate] = useState(DEFAULT_DATE);
  const [textType, setTextType] = useState<TextType>(TextType.PLAINTEXT);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleOnPreview = (e: FormEvent) => {
    e.preventDefault();
    if (
      (textType === TextType.PLAINTEXT && text.plaintext.length !== PLAINTEXT_LENGTH) ||
      (textType === TextType.CIPHERTEXT && text.ciphertext.length !== CIPHERTEXT_LENGTH)
    ) {
      return;
    }
    setIsLoading(true);
    const { year, month, day } = destructDateInputValue(date);
    onSubmit({
      year,
      month,
      day,
      plaintext: textType === TextType.CIPHERTEXT ? undefined : text.plaintext,
      ciphertext: textType === TextType.CIPHERTEXT ? text.ciphertext : undefined,
    });
    setIsLoading(false);
  };

  const handlePlaintextOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      // .replace(/(?:\\(?!x)[a-zA-Z])/g, (str) => str.replace('\\', ''))
      .replace(/(\\x[0-9a-fA-F]{2})/g, (str) => latin1Table[str.toLowerCase()] ?? '')
      // .replace(/\\[btnvfr"'\\]/g, (str) => table[str.toLowerCase()]);
      .replace(/\\[btnvfr]/g, (str) => latin1Table[str.toLowerCase()] ?? '');
    setText({ ...text, plaintext: value });
    if (!isValidPlaintext(value)) {
      // TODO: set error message
    }
  };

  const handleCiphertextOnChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target?.value ?? '';
    if (value.length <= 2) {
      setText({ ...text, ciphertext: '0x' });
      return;
    }
    setText({ ...text, ciphertext: new RegExp(/^0x/).test(value) ? value : `0x${value}` });
    if (!new RegExp(/^0x[0-9a-f]*$/, 'gi').test(value)) {
      // TODO: set error message
    }
  };

  return (
    <form onSubmit={handleOnPreview} className="flex flex-col justify-start items-start w-full mx-auto">
      <div className="flex justify-start items-center w-full mx-auto mb-1">
        <div className="w-3/12">
          <label className="label" htmlFor="">
            <span className="label-text">Key</span>
          </label>
        </div>
        <div className="grow mx-4">
          {/* TODO: separate component */}
          <select
            className="select select-sm select-ghost select-bordered text-type"
            onChange={(e) => setTextType(e.target.value as TextType)}
            defaultValue={textType}
          >
            <option value={TextType.PLAINTEXT}>Plaintext</option>
            <option value={TextType.CIPHERTEXT}>Ciphertext</option>
          </select>
        </div>
        <div className="w-2/12"></div>
      </div>
      <div className="flex justify-start items-start w-full mx-auto">
        <div className="w-3/12">
          {/* TODO: separate component */}
          <input
            className="input input-bordered w-full"
            type="date"
            name=""
            id=""
            value={date}
            min="2020-01-01"
            max={`${new Date().getUTCFullYear()}-${String(new Date().getUTCMonth() + 1).padStart(2, '0')}-${String(
              new Date().getUTCDate(),
            ).padStart(2, '0')}`}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
        <div className="grow mx-4">
          {/* TODO: refactor */}
          {textType === TextType.PLAINTEXT && (
            <>
              <input
                className={`input input-bordered w-full ${
                  isInputFocused
                    ? text.plaintext.length !== 0 && text.plaintext.length !== PLAINTEXT_LENGTH
                      ? 'input-error'
                      : text.plaintext.length === PLAINTEXT_LENGTH
                      ? 'input-success'
                      : ''
                    : ''
                }`}
                type="text"
                name=""
                id=""
                placeholder="Type here"
                defaultValue={text.plaintext}
                onChange={handlePlaintextOnChange}
                onBlur={() => setIsInputFocused(false)}
                onFocus={() => setIsInputFocused(true)}
              />
              <label className="label">
                <span className="label-text-alt">
                  {text.plaintext.length <= PLAINTEXT_LENGTH
                    ? `${PLAINTEXT_LENGTH - text.plaintext.length} characters left`
                    : `${text.plaintext.length - PLAINTEXT_LENGTH} characters over`}
                </span>
              </label>
            </>
          )}
          {textType === TextType.CIPHERTEXT && (
            <>
              <div>
                <input
                  className={`input input-bordered w-full ${
                    text.ciphertext.length !== 0 && text.ciphertext.length !== CIPHERTEXT_LENGTH
                      ? 'input-error'
                      : text.ciphertext.length === CIPHERTEXT_LENGTH
                      ? 'input-success'
                      : ''
                  }`}
                  type="text"
                  name=""
                  id=""
                  placeholder="Type here"
                  value={text.ciphertext}
                  onChange={handleCiphertextOnChange}
                />
              </div>
              <label className="label">
                <span className="label-text-alt">
                  {text.ciphertext.length <= CIPHERTEXT_LENGTH
                    ? `${CIPHERTEXT_LENGTH - text.ciphertext.length} characters left`
                    : `${text.ciphertext.length - CIPHERTEXT_LENGTH} characters over`}
                </span>
              </label>
            </>
          )}
        </div>
        <button
          className="btn w-2/12"
          type="submit"
          disabled={
            isLoading || text.plaintext.length !== PLAINTEXT_LENGTH || text.ciphertext.length !== CIPHERTEXT_LENGTH
          }
        >
          Preview
        </button>
      </div>
    </form>
  );
};

export default PreviewForm;
