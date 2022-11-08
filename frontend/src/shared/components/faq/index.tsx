import { KeyboardEvent, MouseEvent, useRef, useState } from 'react';
import { useThemeContext } from 'src/shared/contexts/theme';

const shapes = [
  [
    'top-[0] left-[56px] w-0 h-0 border-solid border-t-[56px] border-r-[56px] border-b-[0] border-l-[0] border-t-black border-r-transparent border-b-transparent border-l-transparent',
  ],
  [
    'top-[0] left-[56px] w-0 h-0 border-solid border-t-[56px] border-r-[56px] border-b-[0] border-l-[0] border-t-black border-r-transparent border-b-transparent border-l-transparent',
    'top-[0] left-[84px] w-0 h-0 border-solid border-t-[0] border-r-[0] border-b-[28px] border-l-[28px] border-t-transparent border-r-transparent border-b-black border-l-transparent',
    'top-[28px] left-[84px] w-0 h-0 border-solid border-t-[0] border-r-[28px] border-b-[28px] border-l-[0] border-t-transparent border-r-black border-b-transparent border-l-transparent',
  ],
  ['top-[0] left-[56px] w-[56px] h-[56px] bg-black'],
  [
    'top-[0] left-[56px] w-[56px] h-[56px] bg-black',
    'top-[56px] left-[56px] w-0 h-0 border-solid border-t-[0] border-r-[28px] border-b-[28px] border-l-[0] border-t-transparent border-r-black border-b-transparent border-l-transparent',
    'top-[56px] left-[84px] w-0 h-0 border-solid border-t-[28px] border-r-[28px] border-b-[0] border-l-[0] border-t-black border-r-transparent border-b-transparent border-l-transparent',
  ],
  [
    'top-[0] left-[56px] w-[56px] h-[56px] bg-black',
    'top-[56px] left-[56px] w-0 h-0 border-solid border-t-[0] border-r-[56px] border-b-[56px] border-l-[0] border-t-transparent border-r-black border-b-transparent border-l-transparent',
  ],
  ['top-[0] left-[56px] w-[56px] h-[112px] bg-black'],
  [
    'top-[0] left-[56px] w-[56px] h-[112px] bg-black',
    'top-[56px] left-[28px] w-0 h-0 border-solid border-t-[0] border-r-[0] border-b-[28px] border-l-[28px] border-t-transparent border-r-transparent border-b-black border-l-transparent',
    'top-[84px] left-[28px] w-0 h-0 border-solid border-t-[0] border-r-[28px] border-b-[28px] border-l-[0] border-t-transparent border-r-black border-b-transparent border-l-transparent',
  ],
  [
    'top-[0] left-[56px] w-[56px] h-[112px] bg-black',
    'top-[56px] left-[28px] w-0 h-0 border-solid border-t-[0] border-r-[0] border-b-[28px] border-l-[28px] border-t-transparent border-r-transparent border-b-black border-l-transparent',
    'top-[84px] left-[28px] w-0 h-0 border-solid border-t-[0] border-r-[28px] border-b-[28px] border-l-[0] border-t-transparent border-r-black border-b-transparent border-l-transparent',
    'top-[56px] left-[0] w-0 h-0 border-solid border-t-[56px] border-r-[0] border-b-[0] border-l-[56px] border-t-transparent border-r-transparent border-b-transparent border-l-black',
  ],
  ['top-[0] left-[56px] w-[56px] h-[112px] bg-black', 'top-[56px] left-[0] w-[56px] h-[56px] bg-black'],
  [
    'top-[0] left-[56px] w-[56px] h-[112px] bg-black',
    'top-[56px] left-[0] w-[56px] h-[56px] bg-black',
    'top-[28px] left-[28px] w-0 h-0 border-solid border-t-[28px] border-r-[0] border-b-[0] border-l-[28px] border-t-transparent border-r-transparent border-b-transparent border-l-black',
    'top-[28px] left-[0] w-0 h-0 border-solid border-t-[0] border-r-[0] border-b-[28px] border-l-[28px] border-t-transparent border-r-transparent border-b-black border-l-transparent',
  ],
  [
    'top-[0] left-[56px] w-[56px] h-[112px] bg-black',
    'top-[56px] left-[0] w-[56px] h-[56px] bg-black',
    'top-[0] left-[0] w-0 h-0 border-solid border-t-[56px] border-r-[0] border-b-[0] border-l-[56px] border-t-transparent border-r-transparent border-b-transparent border-l-black',
  ],
  ['top-[0] right-[0] w-[112px] h-[112px] bg-black'],
];

const texts = [
  {
    title: 'What is on-chain?',
    body: 'On-chain means all the data necessary for the NFT is stored on the blockchain.',
  },
  {
    title: 'What is a telegram?',
    body: 'Telegram is a written or printed message delivered to a recipient in person.',
  },
  {
    title: 'Does the message have to be "i am still alive"?',
    body: 'No. As long as the message is within sixteen ISO-8859-1 characters. Click on "official" and try it out.',
  },
  {
    title: 'What determines the visual output of a desImage NFT?',
    body: 'Encrypted 16 character message using DES algorithm defines the different shades of grey.',
  },
  {
    title: 'Does the visual output determine the uniqueness of desImage NFT?',
    body: 'No. "Key Clustering" section has more details on this.',
  },
  {
    title: 'What makes a token unique?',
    body: 'The combination of the encryption key and the ciphertext.',
  },
  {
    title: 'What is an encryption key?',
    body: 'DES algorithm requires a key to encrypt and decrypt. For desImage, the key is derived from the date between 2020 January 1 to today.',
  },
  {
    title: 'Can I own a token?',
    body: 'Sure. You can mint it in the catalog page.',
  },
  {
    title: 'Can I buy a token with any crypto currency?',
    body: 'No. Only Ethereum is accepted.',
  },
  {
    title: 'Can I transfer ownership of a minted token to someone else?',
    body: 'Yes. Usually through NFT marketplace platforms.',
  },
  {
    title: 'May I return a token?',
    body: 'No but you can burn it. This means no one will be able to own it.',
  },
  {
    title: 'Are these tokens getting more expensive?',
    body: 'Yes. The price is dependent on the total supply.',
  },
];

const FAQ = () => {
  const { theme } = useThemeContext();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const openBtnElementRef = useRef<HTMLButtonElement>(null);
  const removeBtnElementRef = useRef<HTMLButtonElement>(null);
  const cardElementRef = useRef<HTMLDivElement>(null);

  const handleOpenOnClick = (e: MouseEvent) => {
    e.preventDefault();
    if (document.activeElement === (openBtnElementRef?.current as HTMLElement)) {
      setTimeout(() => {
        (cardElementRef?.current as HTMLElement)?.focus();
      });
    }
    setOpen(true);
  };

  const handleRemoveClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (document.activeElement === (removeBtnElementRef?.current as HTMLElement)) {
      setTimeout(() => {
        (openBtnElementRef?.current as HTMLElement)?.focus();
      });
    }
    setOpen(false);
  };

  const handleCardOnClick = (e: MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    setStep((prev) => {
      if (prev >= 11) {
        return 0;
      }
      return prev + 1;
    });
  };

  const handleCardKeyDown = (e: KeyboardEvent) => {
    if (document.activeElement === (cardElementRef?.current as HTMLElement) && e?.key === 'Enter') {
      handleCardOnClick(e as any);
    }
  };

  if (!open) {
    return (
      <button
        ref={openBtnElementRef}
        className={`fixed bottom-[8px] right-[8px] p-[20px] border-none flex justify-center items-center w-[96px] h-[96px] text-white text-xl font-bold ${
          theme === 'lofi' ? 'bg-black' : 'bg-[#272626]'
        }`}
        onClick={handleOpenOnClick}
      >
        FAQ
      </button>
    );
  }

  return (
    <div
      ref={cardElementRef}
      className="fixed bottom-[8px] right-[8px] p-[20px] pt-[70px] pb-0 border-none flex justify-center items-start cursor-pointer w-[334px] h-[306px] bg-[#ffff8d] text-black"
      onClick={handleCardOnClick}
      onKeyDown={handleCardKeyDown}
      tabIndex={0}
    >
      <div className="absolute top-3 sm:top-4 left-3 sm:left-4 right-3 sm:right-4 flex justify-between">
        <div className="">{step + 1} / 12</div>
        <button
          ref={removeBtnElementRef}
          className="btn btn-square btn-outline btn-sm border-none !w-[28px] !h-[28px] !min-h-[28px] text-black hover:text-white hover:bg-black"
          onClick={handleRemoveClick}
          aria-label="remove"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="relative w-full ">
        <div className="absolute top-0 left-0 w-[112px] h-[112px]">
          {shapes[step].map((s, i) => (
            <div key={i} className={`absolute ${s}`}></div>
          ))}
        </div>
        <div className="flex flex-col justify-start items-start text-left pl-[126px]">
          <h4 className="text-base font-bold">{texts[step].title}</h4>
          <p className="text-base font-normal">{texts[step].body}</p>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
