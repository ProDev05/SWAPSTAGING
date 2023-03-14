import Image from 'next/image';
import { useRef, useState } from 'react';
import Chevron from '@/assets/chevron.svg';
import useOutsideClick from '@/hooks/useOutsideClick';

export default function CurrencyDropdown({ options, selectedId, onChange, className }) {
  const ref = useRef(null);
  const [open, setOpen] = useState(false);

  const selected = options.find(option => option.id === selectedId);

  useOutsideClick(ref, () => setOpen(false));

  return (
    <div ref={ref} className={`relative rounded-t-3xl bg-[#C3EB9B] py-1.5 w-[134px] ${!open ? 'rounded-b-3xl' : ''} ${className} `}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center w-full px-2.5"
      >
        <Image src={selected.image} alt={selected.title} width="28px" height="28px" />
        <span className="text-2xl opacity-50 ml-1.5">{selected.title}</span>
        <Chevron className="w-3.5 h-1.5 fill-transparent stroke-[#242424] grow" />
      </button>
      {open && (
        <div className="absolute bottom-0 px-2.5 rounded-b-3xl top-full h-fit w-full bg-[#C3EB9B]">
          {options.map((option) => {
            if (option.id === selected.id) {
              return null;
            }

            return (
              <button
                key={option.id}
                onClick={() => onChange(option.id)}
                className="flex items-center w-full pb-1.5"
              >
                <Image src={option.image} alt={option.title} width="28px" height="28px" />
                <span className="text-2xl opacity-50 ml-1.5">{option.title}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}