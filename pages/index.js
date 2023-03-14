import { useState } from "react";
import { useMoralis } from "react-moralis";
import "react-dropdown/style.css";
import Link from "next/link";
import Head from "next/head";
import { Scrolling } from "../components/Scrolling";
import Image from 'next/image';
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Preloader from "../components/Preloader/Preloader";
import SwapForm from "../components/SwapForm";
import RateSetModal from "../components/RateSetModal";
import "antd/dist/antd.css";

const options = [
  { label: 'Swap', value: 'swap' },
  { label: 'Liquidity', value: 'liquidity' },
];

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useMoralis();

  const [eventsModalOpen, setEventsModalOpen] = useState(false);

  const eventsModalOpenHandler = () => {
    setEventsModalOpen(true);
  }

  const eventsModalCloseHandler = () => {
    setEventsModalOpen(false);
  }

  return (
    <div>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <!-- HTML Meta Tags --> */}
        <meta
          name="description"
          content="PUT THE FUTURE IN YOUR HANDS - Money from the Player NFT sales is transferred to real teams to help support and develop youth sports leagues! Live YourLIfe and Earn!"
        />

        {/* <!-- Google / Search Engine Tags --> */}
        <meta itemProp="name" content="Your Life Games" />
        <meta
          itemProp="description"
          content="PUT THE FUTURE IN YOUR HANDS - Money from the Player NFT sales is transferred to real teams to help support and develop youth sports leagues! Live YourLife and Earn!"
        />
        <meta
          itemProp="image"
          content="https://nft.yourlifegames.com/static/media/yourlife_white.605e26de.png"
        />

        {/* <!-- Facebook Meta Tags --> */}
        <meta property="og:url" content="https://www.yourlifegames.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Your Life Games" />
        <meta
          property="og:description"
          content="PUT THE FUTURE IN YOUR HANDS - Money from the Player NFT sales is transferred to real teams to help support and develop youth sports leagues! Live YourLife and Earn!"
        />
        <meta
          property="og:image"
          content="https://nft.yourlifegames.com/static/media/yourlife_white.605e26de.png"
        />

        {/* <!-- Twitter Meta Tags --> */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Your Life Games" />
        <meta
          name="twitter:description"
          content="PUT THE FUTURE IN YOUR HANDS - Money from the Player NFT sales is transferred to real teams to help support and develop youth sports leagues - This unique opportunity provides both Fun & Finances at the same time! Live YourLife and Earn!"
        />
        <meta
          name="twitter:image"
          content="https://nft.yourlifegames.com/static/media/yourlife_white.605e26de.png"
        />
      </Head>
      {isLoading && <Preloader />}
      <Scrolling />
      <div className="relative flex flex-col items-center justify-between w-full min-h-screen pt-6 mx-auto overflow-x-hidden">
        {/* Main Container */}

        <Navbar setIsLoading={setIsLoading} />

        {user && user.attributes.isSuperAdmin && (
          <>
            <div className="w-full px-3">
              <button className="bg-[#ffffff] rounded-md px-5 pb-3 pt-3 stripe_rate_btn" onClick={eventsModalOpenHandler}>
                <Image src="/assets/btn_stripe.png" width={20} height={20} /><span>SET RATE FOR STRIPE</span>
              </button>
            </div>

            <div className="flex mt-10 bg-gray-300 rounded">
              <Link href="/">
                <a className="flex items-center justify-center h-8 px-4 bg-[#90E040] rounded">
                  Swap
                </a>
              </Link>
              <Link href="liquidity">
                <a className="flex items-center justify-center h-8 px-4 rounded">
                  Liquidity
                </a>
              </Link>
            </div>

            {eventsModalOpen && (
              <RateSetModal onClose={eventsModalCloseHandler} />
            )}
          </>
        )}

        <SwapForm setIsLoading={setIsLoading} />

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
