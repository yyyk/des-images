import { FormEvent, useState } from 'react';
import {
  CIPHERTEXT_LENGTH,
  DEFAULT_CIPHERTEXT,
  DEFAULT_DATE,
  DEFAULT_PLAINTEXT,
  PLAINTEXT_LENGTH,
} from 'src/shared/constants';
import { TextType } from 'src/mod/interfaces';
import { PreviewFormData } from 'src/shared/interfaces';
import TextInput from 'src/shared/components/textInput';
import DateInput from 'src/shared/components/dateInput';
import TextTypeSelect from 'src/shared/components/textTypeSelect';
import { destructDateInputValue } from 'src/shared/utils/destructDateInputValue';

interface ModPreviewFormProps {
  defaultPlaintext?: string;
  defaultCiphertext?: string;
  defaultDate?: string;
  showHint?: boolean;
  onSubmit: ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => void;
}

const ModPreviewForm = ({
  defaultPlaintext = DEFAULT_PLAINTEXT,
  defaultCiphertext = DEFAULT_CIPHERTEXT,
  defaultDate = DEFAULT_DATE,
  showHint = false,
  onSubmit,
}: ModPreviewFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState({
    plaintext: defaultPlaintext,
    ciphertext: defaultCiphertext,
    isValid: true,
  });
  const [date, setDate] = useState<string>(defaultDate);
  const [textType, setTextType] = useState<TextType>(TextType.PLAINTEXT);

  const handleTextInputOnChange = (value: { plaintext: string; ciphertext: string; isValid: boolean }) => {
    setText(value);
  };

  const handleOnPreview = (e: FormEvent) => {
    e.preventDefault();
    if (
      !date ||
      (textType === TextType.PLAINTEXT && text.plaintext.length !== PLAINTEXT_LENGTH) ||
      (textType === TextType.CIPHERTEXT && text.ciphertext.length !== CIPHERTEXT_LENGTH)
    ) {
      return;
    }
    setIsLoading(true);
    onSubmit({
      ...destructDateInputValue(date),
      plaintext: textType === TextType.CIPHERTEXT ? undefined : text.plaintext,
      ciphertext: textType === TextType.CIPHERTEXT ? text.ciphertext : undefined,
    });
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleOnPreview} className="flex flex-col justify-start items-start">
      <div className="flex justify-start items-center w-full mx-auto mb-1">
        <div className="w-3/12">
          <label className="label" htmlFor="">
            <span className="label-text">Key</span>
          </label>
        </div>
        <div className="grow mx-4 flex flex-row justify-start items-start">
          <TextTypeSelect defaultValue={TextType.PLAINTEXT} onChange={(value) => setTextType(value)} />
          {showHint && (
            <div className="tooltip tooltip-top ml-0.5" data-tip="have you clicked 'official'?">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </div>
        <div className="w-2/12"></div>
      </div>
      <div className="flex justify-start items-start w-full mx-auto">
        <div className="w-3/12">
          <DateInput defaultValue={defaultDate} showLabel={false} onChange={(value) => setDate(value)} />
        </div>
        <div className="grow mx-4">
          <TextInput
            defaultValue={{ plaintext: defaultPlaintext, ciphertext: defaultCiphertext }}
            textType={textType}
            onChange={handleTextInputOnChange}
          />
        </div>
        <button
          className="btn w-2/12"
          type="submit"
          disabled={
            isLoading ||
            !text.isValid ||
            (textType === TextType.PLAINTEXT && text.plaintext.length !== PLAINTEXT_LENGTH) ||
            (textType === TextType.CIPHERTEXT && text.ciphertext.length !== CIPHERTEXT_LENGTH)
          }
        >
          Preview
        </button>
      </div>
    </form>
  );
};

export default ModPreviewForm;
