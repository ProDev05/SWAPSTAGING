import Badge from "./Badge";
import dayjs from "dayjs";

export default function Event({
  date,
  title,
  content,
  status,
  isHot
}) {
  return (
    <div className="flex flex-col items-start p-8 mb-4 bg-white last:mb-0">
      <span className="text-xs self-end text-[#737373]">{dayjs(date).format('HH:mm')}</span>
      <div className="flex items-center mb-3">
        <h4 className="text-2xl text-[#242424] font-semibold mr-4">{title}</h4>
        <Badge type={status} className="mr-1" />
        {isHot && <Badge type="hot" />}
      </div>
      <p className="text-left">{content}</p>
    </div>
  )
}