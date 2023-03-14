import React from "react";

export const Input = ({
  value,
  placeholder,
  type,
  onChange,
  wallet,
  amount,
  token,
  validWalletAddress,
}) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange}
    className={`w-[98%] h-[3rem] rounded-2xl bg-[#f6f6f7] text-2xl font-bold text-[#242424] mx-auto text-left p-8 pl-4 mb-2 outline-none ${
      wallet && "text-base font-normal p-4"
    } ${amount && "w-[100%]"}
      ${token && "mt-2 mb-10"}
      ${!validWalletAddress ? "border-2 border-red-500" : "border-2 border-green-500"}
    `}
  />
);
