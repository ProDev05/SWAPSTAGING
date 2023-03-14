import React, { useState, useRef, useEffect } from "react";
import Logo from "../assets/Logoemblem.svg";
import Link from "next/link";
import Account from "./Account";
import Burger from '@/assets/burger.svg';
import Cross from '@/assets/cross.svg';
import EventsModal from "./EventsModal";
import { useMoralis } from "react-moralis";
import MarketPlaceSVG from '/assets/marketplace.svg';
import SwitchNetwork from "./SwitchNetwork";

export default function Navbar({ setIsLoading }) {
  const [openMobileMenu, setOpenMobileMenu] = useState(false);
  const [eventsModalOpen, setEventsModalOpen] = useState(false);
  const [tokenURI, setTokenURI] = useState("")
  const { authenticate, isAuthenticated, user } = useMoralis();

  const authUser = () => authenticate({
    provider: process.env.NEXT_PUBLIC_WEB3AUTH_PROVIDER,
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
    theme: process.env.NEXT_PUBLIC_THEME,
    clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
  })

  const toggleMobileMenuHandler = () => setOpenMobileMenu(!openMobileMenu)

  const eventsModalOpenHandler = () => setEventsModalOpen(true)

  const eventsModalCloseHandler = () => setEventsModalOpen(false)

  const ColoredLine = ({ color }) => (
    <hr
      style={{
        color: color,
        backgroundColor: color,
        height: 1,
        width: "100%"
      }}
    />
  );

  useEffect(() => {
    setTokenURI(`?token=${user?.id}`)
  }, [isAuthenticated])

  const mobileMenu = (
    <div className="flex shadow md:hidden absolute top-full items-start mt-3 right-3 left-3 justify-between px-4 py-5 rounded-xl bg-[#ffffff] z-[11]">
      <div className="flex flex-col items-start w-full text-center">

        <Link key={1} href={`${"https://nft.yourlifegames.com/nftMarket"}${tokenURI}`}>
          <a className="block w-full no-underline text-md uppercase underline underline-offset-8 decoration-[#90E040] mb-4">
            <MarketPlaceSVG />
            Marketplace
          </a>
        </Link>
        {
          user && user.attributes.isSuperAdmin && (
            <Link key={5} href="/transfers" >
              <a className="block w-full no-underline text-md uppercase underline underline-offset-8 decoration-[#90E040] mb-4">
                Transfers
              </a>
            </Link>
          )
        }

        <Link key={2} href={`${"https://nft.yourlifegames.com/myaccount"}${tokenURI}`}>
          <a className="block w-full no-underline text-md uppercase underline underline-offset-8 decoration-[#90E040] mb-4">
            My account
          </a>
        </Link>

        <Link key={3} href={`${"https://nft.yourlifegames.com/collections"}${tokenURI}`}>
          <a className="block w-full no-underline text-md uppercase underline underline-offset-8 decoration-[#90E040] mb-4">
            Collections
          </a>
        </Link>

        <Link key={4} href={`${"https://nft.yourlifegames.com/chat"}${tokenURI}`}>
          <a className="block w-full no-underline text-md uppercase underline underline-offset-8 decoration-[#90E040] mb-4">
            Chat
          </a>
        </Link>
        <ColoredLine color="grey" />
        <div className="w-full px-3 pt-3">
          <button
            onClick={authUser}
            type="button"
            className="w-full h-10 px-6 py-2 m-auto uppercase rounded-lg"
          >
            Authenticate
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="relative flex items-center w-full h-20 px-3 text-center shrink-0">
      {/* logo container */}
      <div className="bg-[#242424] mr-[70px] min-w-[120px] relative h-full rounded-l-xl flex justify-center items-center with-triangle triangle">
        <Logo className="w-10 h-10 fill-white" />
        {/* <Image src={Logo} alt="logo" width={60} height={60} objectFit="contain" /> */}
        {/* <p className="mr-10 text-xl font-bold text-white uppercase">ylg</p> */}
      </div>

      {/* Navbar Links */}
      <div className="flex h-full w-full pr-6 sm:pr-12 bg-[#ffffff] rounded-r-xl items-center justify-between white-triangle-reverted with-triangle">
        <button className="absolute block right-10 md:hidden" onClick={toggleMobileMenuHandler}>
          {!openMobileMenu ? (<Burger className="w-10 h-2" />) : (<Cross className="w-5 h-5" />)}
        </button>
        <div className="hidden md:flex">
          <Link key={1} href={`${"https://nft.yourlifegames.com/nftMarket"}${tokenURI}`}>
            <a className="flex text-md text-[#242424] uppercase underline underline-offset-8 underline-color decoration-[#90E040] mr-4">
              <MarketPlaceSVG />
              Marketplace
            </a>
          </Link>
          {
            user && user.attributes.isSuperAdmin && (
              <Link kye={5} href="/transfers" >
                <a className="flex text-md text-[#242424] uppercase underline underline-offset-8 underline-color decoration-[#90E040] mr-4">
                  Transfers
                </a>
              </Link>
            )
          }

          <Link key={2} href={`${"https://nft.yourlifegames.com/myaccount"}${tokenURI}`}>
            <a className="flex text-md text-[#242424] uppercase underline underline-offset-8 underline-color decoration-[#90E040] mr-4">
              My account
            </a>
          </Link>

          <Link key={3} href={`${"https://nft.yourlifegames.com/collections"}${tokenURI}`}>
            <a className="flex text-md text-[#242424] uppercase underline underline-offset-8 underline-color decoration-[#90E040] mr-4">
              Collections
            </a>
          </Link>

          <Link key={4} href={`${"https://nft.yourlifegames.com/chat"}${tokenURI}`}>
            <a className="flex text-md text-[#242424] uppercase underline underline-offset-8 underline-color decoration-[#90E040] mr-4">
              Chat
            </a>
          </Link>
        </div>

        {/* user account*/}
        <div className="relative items-center hidden md:flex">
          <div className="px-2">
            <SwitchNetwork />
          </div>
          <Account
            setIsLoading={setIsLoading}
            openEventsModal={eventsModalOpenHandler}
            onAuth={authUser}
          />
        </div>
      </div>

      {/* mobileMenu */}
      {openMobileMenu && mobileMenu}

      {eventsModalOpen && <EventsModal onClose={eventsModalCloseHandler} />}
    </div >
  );
};
