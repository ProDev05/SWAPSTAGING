import { useEffect } from 'react';

export default function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      const { target } = event;
      if (!ref.current || ref.current.contains(target)) {
        return;
      }

      handler(event);
    };

    document.addEventListener('click', listener);

    return () => {
      document.removeEventListener('click', listener);
    };
  }, [ref, handler]);
}

