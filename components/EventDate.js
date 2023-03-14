import dayjs from "dayjs";

export default function EventDate({ date }) {
  const day = dayjs(date).format('dddd');
  const dayOfMonth = dayjs(date).format('D MMMM');

  return (
    <div className="text-[#737373] mb-4">
      {day} · {dayOfMonth}
    </div>
  )
}