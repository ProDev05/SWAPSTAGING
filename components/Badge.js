import {useMemo} from "react";

export default function Badge({ type, className }) {
  const component = useMemo(() => {
    switch (type) {
      case 'new':
        return {
          class: 'bg-[#90E040]',
          content: 'New',
        }
      case 'hot':
        return {
          class: 'bg-[#FFD24C]',
          content: '🔥'
        }
      default:
        return {
          class: 'bg-[#F2F3F5] text-[#737373]',
          content: 'Read',
        }
    }
  }, [type]);



  return (
    <span className={`px-2 py-0.5 uppercase h-fit rounded text-xs shrink-0 ${component.class} ${className}`}>
       <span>{component.content}</span>
    </span>
  );
}