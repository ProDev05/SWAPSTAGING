import Search from "../assets/search.svg";
import Cross from "../assets/cross.svg";
import Link from "next/link";
import EventDate from "./EventDate";
import Event from "./Event";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Check2Circle } from "react-bootstrap-icons";
import { useMoralis } from "react-moralis";
import { dateFormat, shortenAddress } from "../utils/helperFunction";

const perPage = 10;

export default function EventsModal({ onClose }) {
  const [totalPage, setTotalPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [swapTokenLogs, setSwapTokenLogs] = useState([]);
  const [toggleFiltersModal, setToggleFiltersModal] = useState(false);
  const [swapTokenLogsQuery, setSwapTokenLogsQuery] = useState([]);
  const { isInitialized, isAuthenticated, Moralis, user } = useMoralis();

  async function loadSwapTokenLogs() {
    const data = await Moralis.Cloud.run("getSwapTokenLogByUser", {
      address: user?.attributes.ethAddress,
    });
    // console.log(data);
    setSwapTokenLogsQuery(data);
  }

  useEffect(() => {
    if (isInitialized) {
      loadSwapTokenLogs();
    }
  }, [isAuthenticated]);

  const showFiltersModal = () => {
    setToggleFiltersModal(true);
  };

  const nextPage = () => {
    setCurrentPage(++currentPage);
  };

  const prevPage = () => {
    // let minPage = currentPage - 1;
    setCurrentPage(--currentPage);
  };

  return (
    <div className="fixed w-screen h-screen bg-[#242424] top-0 left-0 bg-opacity-50 z-[11] flex justify-end">
      <div className="max-w-2xl w-full h-screen bg-[#F2F3F5] opacity-100 shrink-0 pt-10 md:pt-20 px-10 overflow-y-auto">
        <button
          className="flex md:hidden w-10 h-10 ml-auto bg-[#f2f3f5] rounded-full justify-center items-center mb-8"
          onClick={onClose}
        >
          <Cross className="w-5 h-5 stroke-[#242424]" />
        </button>
        <div className="flex items-end justify-between mb-8">
          <h2 className="text-5xl font-bold uppercase">Events</h2>
        </div>

        <div>
          <div className="flex justify-between">
            <div className="flex pt-2">
              <div className="pt-1">
                {currentPage} / {totalPage}
              </div>

              <div className="pl-6 pr-8">
                <button
                  className="max-w-fit  max-h-fit bg-white rounded-full p-1.5"
                  onClick={prevPage}
                  disabled={currentPage == 1}
                >
                  <ArrowLeft className="text-blue-600" />
                </button>
              </div>

              <div>
                <button
                  className="max-w-fit  max-h-fit bg-white rounded-full p-1.5"
                  onClick={nextPage}
                  disabled={currentPage == totalPage}
                >
                  <ArrowRight className="text-blue-600" />
                </button>
              </div>
            </div>
          </div>

          {/* body */}
          <div className="">
            <table className="w-full text-left border-separate table-auto border-spacing-y-2 table-modal">
              <thead>
                <tr>
                  <th>User</th>
                  <th>address</th>
                  <th>USD</th>
                  <th>YLT</th>
                  <th>TIMESTAMP</th>
                  <th>TRANSACTION</th>
                </tr>
              </thead>
              <tbody>
                {swapTokenLogsQuery ? (
                  swapTokenLogsQuery.map((swapTokenLog, i) => (
                    <tr key={i}>
                      <td className="normal-case">{swapTokenLog.email}</td>
                      <td>{shortenAddress(swapTokenLog.address)}</td>
                      <td>{swapTokenLog.token_amount}</td>
                      <td>{swapTokenLog.ylt_amount}</td>
                      <td>{dateFormat(swapTokenLog.createdAt)}</td>
                      <td>
                        <a href="#" className="ylg-link">
                          {swapTokenLog.token_type == 1 ? "Stripe" : "Crypto"}{" "}
                          {swapTokenLog.state == 1 && (
                            <Check2Circle className="inline-block" />
                          )}
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <></>
                )}
              </tbody>
            </table>
          </div>

          {/* footer */}
          <div className="flex justify-start">
            <div className="pt-1">
              {currentPage} / {totalPage}
            </div>
            <div className="pl-6 pr-8">
              {currentPage > 1 ? (
                <button
                  className="max-w-fit  max-h-fit bg-white rounded-full p-1.5"
                  onClick={prevPage}
                >
                  <ArrowLeft className="text-blue-600" />
                </button>
              ) : (
                <div className="max-w-fit  max-h-fit bg-white rounded-full p-1.5">
                  <ArrowLeft className="text-garry-600" />
                </div>
              )}
            </div>

            <div>
              {currentPage < totalPage ? (
                <button
                  className="max-w-fit  max-h-fit bg-white rounded-full p-1.5"
                  onClick={nextPage}
                >
                  <ArrowRight className="text-blue-600" />
                </button>
              ) : (
                <div className="max-w-fit  max-h-fit bg-white rounded-full p-1.5">
                  <ArrowRight className="text-garry-600" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
  <button
    className="hidden md:flex w-10 h-10 bg-[#f2f3f5] rounded-full justify-center items-center mr-8 mt-20"
    onClick={onClose}
  >
    <Cross className="w-5 h-5 stroke-[#242424]" />
  </button>
*/