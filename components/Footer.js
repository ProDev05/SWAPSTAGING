import Logo from '@/assets/FullLogo.svg';

export default function Footer() {
  return (
    <footer className="w-full px-4 sm:px-10">
      <div className="w-full h-[140px] flex items-center px-5 sm:px-14 bg-[#242424] rounded-[32px]">
        <div className="flex-grow">
          <Logo className="h-16" />
        </div>
      </div>
      <p className="uppercase text-[#646464] ml-5 sm:ml-14">Yourlife. 2022</p>
    </footer>
  )
}