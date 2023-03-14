import { useEffect, useRef, useState } from 'react';
import { useMoralis } from "react-moralis";
import Image from 'next/image';
import { Web3Auth } from "@web3auth/web3auth";
import { Router } from "next/router";
import userDefaultAvatar from '@/assets/user.png';
import Chevron from '@/assets/chevron.svg';
import useOutsideClick from "../hooks/useOutsideClick";
import Bell from '@/assets/bell.svg';

const isBrowser = typeof window !== 'undefined';
const BtnLogout = function ({ handleLogout }) {
  return (
    <div className="absolute flex py-4 px-4 top-16 w-40 bg-[#242424] text-white rounded-lg">
      <button onClick={handleLogout}>
        Logout
      </button>
    </div>
  )
}

export default function Account({ setIsLoading, openEventsModal, onAuth }) {
  const ref = useRef(null);

  const { Moralis, user, logout, isAuthenticated } = useMoralis();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const profilePicture = user?.attributes.profile_picture;

  useEffect(() => {
    if (!isBrowser) return;
    if (isAuthenticated) {
      const loadEmail = async () => {
        try {
          const web3Auth = new Web3Auth({
            clientId: process.env.NEXT_PUBLIC_CLIENT_ID,
            chainConfig: {
              chainNamespace: process.env.NEXT_PUBLIC_CHAIN_NAMESPACE,
              chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
              rpcTarget: process.env.NEXT_PUBLIC_SERVER_URL,
              displayName: process.env.NEXT_PUBLIC_DISPLAY_NAME,
              blockExplorer: process.env.NEXT_PUBLIC_BLOCK_EXPLORER,
              ticker: process.env.NEXT_PUBLIC_TICKER,
              tickerName: process.env.NEXT_PUBLIC_TICKER_NAME
            }
          });

          await web3Auth.initModal();

          const userInfo = await web3Auth.getUserInfo();

          if (userInfo.email) {
            const isEmail = await Moralis.Cloud.run('searchEmail', {
              email: userInfo.email,
              ethAddress: address
            });

            if (isEmail) {
              const { id } = user;

              await logout();
              const result = await Moralis.Cloud.run('deleteRecord', { id })

              if (result) {
                alert('This email already exist');
                Router.push('/')
              }
            } else {
              const { id } = user;
              const result = await Moralis.Cloud.run('addEmail', { id, email: userInfo.email })

              if (result) {
                Router.push('/');
              }
            }
          } else {
            if (!user.attributes.email) {
            } else {
              Router.push('/');
            }
          }
        } catch (error) {
          // console.log('catch', error);
        }
      };
      loadEmail();
    }
  }, [isAuthenticated, Router, logout, user]);

  const getUserName = () => {
    if (user && user.attributes.nickname) {
      return user.attributes.nickname;
    }
    const { ethAddress } = user?.attributes;

    return `${ethAddress?.slice(0, 6)
      }...${ethAddress?.slice(-4)
      }`
  };

  const toggleUserMenu = () => setUserMenuOpen(userMenuOpen => !userMenuOpen)

  const closeUserMenu = () => setUserMenuOpen(false)

  useOutsideClick(ref, closeUserMenu);

  if (isAuthenticated)
    return (
      <div ref={ref}
        className="relative flex items-center justify-center">
        <button onClick={toggleUserMenu} className="flex">
          <Image src={
            profilePicture ?? userDefaultAvatar
          }
            width="40px"
            height="40px"
            className="rounded-full bg-[#90e040]"
            alt="profile picture" />
          <div className="ml-3 hidden sm:block uppercase mr-2.5 my-auto">
            {getUserName()}
          </div>
          <Chevron className="w-3.5 h-1.5 fill-transparent my-auto stroke-[#242424] grow" />
        </button>
        <div className="h-12 w-[1px] bg-[#242424] mx-4 opacity-30"></div>
        <button className="h-8 w-8 rounded-full bg-[#F3F4F6] shrink-0 flex justify-center items-center"
          onClick={openEventsModal}>
          <Bell />
        </button>
        {/*user menu*/}
        {userMenuOpen && <BtnLogout handleLogout={logout} />}
      </div>
    )

  return (
    <button onClick={onAuth}
      type="button"
      className="hidden sm:flex items-center bg-[#3985F5] py-2 px-6 rounded-lg sm:ml-20 text-white uppercase h-10">
      Authenticate
    </button>
  );
}