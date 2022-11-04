import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  CIPHERTEXT_LENGTH,
  DEFAULT_CIPHERTEXT,
  DEFAULT_DATE,
  DEFAULT_PLAINTEXT,
  PLAINTEXT_LENGTH,
} from 'src/shared/constants';
import { TextType } from 'src/mod/interfaces';
import { NOTIFICATION_TYPE, PreviewFormData } from 'src/shared/interfaces';
import { destructDateInputValue } from 'src/shared/utils/formHelpers';
import TextInput from 'src/shared/components/textInput';
import DateInput from 'src/shared/components/dateInput';
import TextTypeSelect from 'src/shared/components/textTypeSelect';
import { getTokenDataFromTokenIds } from 'src/shared/utils/tokenDataHelpers';
import { useContractContext } from 'src/shared/contexts/contract';
import { BigNumber } from 'ethers';
import { getOwnerOfByTokenId } from 'src/shared/services/contract';
import { useWalletContext } from 'src/shared/contexts/wallet';
import { isSameAddress } from 'src/shared/utils/contractHelpers';
import { useNotificationContext } from 'src/shared/contexts/notification';

const KeyLabel = () => (
  <label className="label" htmlFor="">
    <span className="label-text">Key</span>
  </label>
);

const TypeSelect = ({
  showHint,
  showTokenIdOption,
  onChange,
}: {
  showHint: boolean;
  showTokenIdOption: boolean;
  onChange: (value: TextType) => void;
}) => (
  <>
    <TextTypeSelect defaultValue={TextType.PLAINTEXT} showTokenIdOption={showTokenIdOption} onChange={onChange} />
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
  </>
);

interface ModPreviewFormProps {
  defaultPlaintext?: string;
  defaultCiphertext?: string;
  defaultDate?: string;
  showHint?: boolean;
  showTokenIdInput?: boolean;
  onSubmit: ({ year, month, day, plaintext, ciphertext }: PreviewFormData) => void;
}

const ModPreviewForm = ({
  defaultPlaintext = DEFAULT_PLAINTEXT,
  defaultCiphertext = DEFAULT_CIPHERTEXT,
  defaultDate = DEFAULT_DATE,
  showHint = false,
  showTokenIdInput = false,
  onSubmit,
}: ModPreviewFormProps) => {
  const { walletAddress } = useWalletContext();
  const { contract } = useContractContext();
  const { add: addNotification } = useNotificationContext();
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState<{ plaintext: string; ciphertext: string; tokenId: string; isValid: boolean }>({
    plaintext: defaultPlaintext,
    ciphertext: defaultCiphertext,
    tokenId: '',
    isValid: true,
  });
  const [date, setDate] = useState<string>(defaultDate);
  const [textType, setTextType] = useState<TextType>(TextType.PLAINTEXT);
  const prevShowTokenIdInput = useRef(showTokenIdInput);
  const shouldShowHint = textType !== TextType.PLAINTEXT ? false : showHint;

  useEffect(() => {
    if (!showTokenIdInput && prevShowTokenIdInput.current) {
      setTextType(TextType.PLAINTEXT);
    }
    prevShowTokenIdInput.current = showTokenIdInput;
  }, [showTokenIdInput]);

  const handleTextInputOnChange = (value: {
    plaintext: string;
    ciphertext: string;
    tokenId: string;
    isValid: boolean;
  }) => {
    setText(value);
  };

  const handleOnPreview = async (e: FormEvent) => {
    e.preventDefault();
    if (
      !date ||
      (textType === TextType.PLAINTEXT && text.plaintext.length > PLAINTEXT_LENGTH) ||
      (textType === TextType.CIPHERTEXT && text.ciphertext.length !== CIPHERTEXT_LENGTH) ||
      (textType === TextType.TOKEN_ID && text.tokenId.length === 0)
    ) {
      return;
    }
    setIsLoading(true);
    if (textType === TextType.TOKEN_ID) {
      if (contract && text.tokenId.length) {
        //TODO: check if the token is owned by the user
        // 60114598768532421696374607022791738811469092434450248593684004579539945911496
        // 0x84e7a83afbc4a78787ce69041aeee475484a249d787ae8b7dd150c397385f4c8
        const tokenId = BigNumber.from(text.tokenId).toHexString();
        try {
          const owner = await getOwnerOfByTokenId(contract, tokenId);
          const data = await getTokenDataFromTokenIds(contract, [tokenId]);
          if (data.length) {
            const { year, month, day, plaintext, ciphertext } = data[0];
            onSubmit({
              year,
              month,
              day,
              plaintext: isSameAddress(owner, walletAddress) || plaintext === DEFAULT_PLAINTEXT ? plaintext : '',
              ciphertext,
            });
          }
        } catch (err) {
          addNotification({ type: NOTIFICATION_TYPE.WARNING, text: 'Invalid Token ID.' });
        }
      }
    } else {
      onSubmit({
        ...destructDateInputValue(date),
        plaintext: textType === TextType.CIPHERTEXT ? undefined : text.plaintext.padEnd(PLAINTEXT_LENGTH, ' '),
        ciphertext: textType === TextType.CIPHERTEXT ? text.ciphertext : undefined,
      });
    }
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleOnPreview} className="flex flex-col justify-start items-start">
      <div className="hidden sm:flex justify-start items-center w-full mx-auto mb-1">
        <div className="w-3/12">
          <KeyLabel />
        </div>
        <div className="grow flex flex-row justify-start items-start">
          <TypeSelect
            showHint={shouldShowHint}
            showTokenIdOption={showTokenIdInput}
            onChange={(value) => setTextType(value)}
          />
        </div>
        <div className="w-2/12"></div>
      </div>
      <div className="flex flex-col sm:flex-row justify-start items-start w-full mx-auto">
        <div className="w-full sm:w-3/12">
          <div className="w-full block sm:hidden px-2">
            <KeyLabel />
          </div>
          <DateInput
            classNames="relative sm:rounded-r-none sm:border-r-0 sm:focus:z-10"
            defaultValue={defaultDate}
            showLabel={false}
            disabled={textType === TextType.TOKEN_ID}
            onChange={(value) => setDate(value)}
          />
        </div>
        <div className="w-full sm:w-auto grow mx-0 mt-4 sm:mt-0">
          <div className="flex sm:hidden flex-row justify-start items-start mb-1">
            <TypeSelect
              showHint={shouldShowHint}
              showTokenIdOption={showTokenIdInput}
              onChange={(value) => setTextType(value)}
            />
          </div>
          <TextInput
            classNames="relative sm:rounded-l-none sm:rounded-r-none sm:border-r-0 sm:focus:border-r sm:focus:z-10"
            defaultValue={{ plaintext: defaultPlaintext, ciphertext: defaultCiphertext, tokenId: '' }}
            textType={textType}
            onChange={handleTextInputOnChange}
          />
        </div>
        <button
          className={`relative btn w-full sm:w-2/12 mt-2 sm:mt-0 sm:rounded-l-none ${isLoading ? 'loading' : ''}`}
          type="submit"
          disabled={
            isLoading ||
            !text.isValid ||
            (textType === TextType.PLAINTEXT && text.plaintext.length > PLAINTEXT_LENGTH) ||
            (textType === TextType.CIPHERTEXT && text.ciphertext.length !== CIPHERTEXT_LENGTH) ||
            (textType === TextType.TOKEN_ID && (!text.tokenId || text.tokenId.length === 0))
          }
        >
          {!isLoading && 'Preview'}
        </button>
      </div>
    </form>
  );
};

export default ModPreviewForm;
