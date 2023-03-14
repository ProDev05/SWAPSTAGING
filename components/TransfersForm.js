import { useEffect, useState } from "react";
import { useMoralis } from "react-moralis";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check2Circle } from "react-bootstrap-icons";
import userDefaultAvatar from "../assets/user.png";
import FiltersModal from "../components/FiltersModal";
import { shortenAddress, dateFormat } from "../utils/helperFunction";
import { ethers } from "ethers";
import YLTABI from "../contracts/abi/YLT.json";

const YLTtokenAddress = process.env.NEXT_PUBLIC_YLTtokenAddress;

export default function TransfersForm({ setIsLoading }) {
  const { isInitialized, isAuthenticated, Moralis } = useMoralis();
  const [swapTokenLogs, setSwapTokenLogs] = useState([]);
  const [toggleFiltersModal, setToggleFiltersModal] = useState(false);
  const [swapTokenLogsQuery, setSwapTokenLogsQuery] = useState([]);

  const [lastPage, setLastPage] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [USDamountRange, setUSDamountRange] = useState([0, 0]);
  const [paymentTypes, setPaymentTypes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [transferState, setTransferState] = useState([]);

  let perPage = 10;

  async function loadSwapTokenLogs() {
    const data = await fetchData();
    setSwapTokenLogsQuery(data);
  }

  useEffect(() => {
    if (isInitialized) {
      loadSwapTokenLogs();
    }
  }, [
    isAuthenticated,
    searchKeyword,
    USDamountRange,
    paymentTypes,
    selectedIds,
    transferState,
  ]);

  useEffect(() => {
    setLastPage(getLastPage(swapTokenLogsQuery));
    if (lastPage < currentPage) {
      setCurrentPage(1);
    }

    pagination();
  }, [currentPage, swapTokenLogsQuery]);

  function getLastPage(result) {
    if (!result || result.length < 0) {
      return 1;
    }
    return Math.ceil(result.length / perPage);
  }

  const changeSearchKeyword = (evt) => {
    setSearchKeyword(evt.target.value);
  };

  async function fetchData() {
    let query = await Moralis.Cloud.run("getSwapTransfers", {
      searchKeyWord: searchKeyword,
    });
    if (!query || query.length == 0) {
      return [];
    }

    if (USDamountRange[0] != 0 || USDamountRange[1] != 0) {
      query = query.filter((log, i) => {
        if (
          log.token_amount >= USDamountRange[0] &&
          log.token_amount <= USDamountRange[1]
        ) {
          return log;
        }
      });
    }

    if (paymentTypes.length > 0) {
      query = query.filter((log, i) => {
        if (paymentTypes.includes(log.token_type)) {
          return log;
        }
      });
    }

    if (transferState.length > 0) {
      query = query.filter((log, i) => {
        if (transferState.includes(log.state)) {
          return log;
        }
      });
    }

    return query;
  }

  const pagination = () => {
    if (swapTokenLogsQuery && swapTokenLogsQuery.length > 0) {
      setSwapTokenLogs(
        swapTokenLogsQuery.slice(
          (currentPage - 1) * perPage,
          currentPage * perPage
        )
      );
    } else {
      setSwapTokenLogs([]);
    }
  };

  const filtersModalCloseHandler = () => {
    setToggleFiltersModal(false);
  };

  const showFiltersModal = () => {
    setToggleFiltersModal(true);
  };

  const nextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    // let minPage = currentPage - 1;
    setCurrentPage(currentPage - 1);
  };

  const changeUSDamountRange = (amounts) => {
    setUSDamountRange(amounts);
  };

  const filterByPaymentType = (types) => {
    setPaymentTypes(types);
  };

  const filterByTransferState = (states) => {
    setTransferState(states);
  };

  const transfer = async () => {
    setIsLoading(true);
    for (let i = 0; i < selectedIds.length; i++) {
      let id, address, amount;
      const res = await Moralis.Cloud.run("getSwapTokenLog", {
        id: selectedIds[i],
      });
      if (res.attributes.token_type != 2) {
        return false;
      }
      id = res.id;
      address = res.attributes.address;
      amount = res.attributes.token_amount;
      if (
        id == null ||
        id == undefined ||
        address == null ||
        address == undefined ||
        amount == null ||
        amount == undefined
      ) {
        res.status(500).json({ msg: "Internal Server Error!!!" });
        return false;
      }

      await Moralis.Cloud.run("updateSwapTokenLog", {
        objectId: selectedIds[i],
        state: 1,
      });

      const privateKey = process.env.NEXT_PUBLIC_MARKETING_PRIVATE_KEY;

      // Connect a wallet to mainnet
      let provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_SERVER_URL
      );

      let walletWithProvider = new ethers.Wallet(privateKey, provider);

      const YLTContract = new ethers.Contract(
        YLTtokenAddress,
        YLTABI,
        walletWithProvider
      );
      let tx = await YLTContract.transfer(
        address,
        ethers.utils.parseUnits(Number(amount).toString(), 18)
      );
      await tx.wait();
    }
    setIsLoading(false);
    setSelectedIds([]);
    pagination();
  };

  const changeSelectedId = (objId) => {
    let ids = selectedIds;
    const index = ids.indexOf(objId);
    if (index === -1) {
      ids.push(objId);
    } else {
      ids.splice(index, 1);
    }
    setSelectedIds(ids);
    pagination();
  };

  return (
    <div className="relative w-full px-8 pt-3 pb-5">
      {" "}
      {/* Inner Container */}
      <div>
        <Link href="/" className="text-slate-500 hover:text-slate-800">
          Back
        </Link>
      </div>
      <div className="text-6xl font-bold uppercase">Swap Transfers</div>
      {/* ---------------------- Table with pagination ------------------  */}
      <div className="pt-16">
        {/* header */}
        <div className="flex justify-between">
          <div className="flex pt-2">
            <div className="pt-1">
              {currentPage} / {lastPage}
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
              {currentPage < lastPage ? (
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

          <div className="flex">
            <div>
              <label className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">
                Search
              </label>
              <div className="relative">
                <input
                  type="search"
                  id="search"
                  className="block w-full p-3 pl-3 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                  placeholder="Search"
                  required
                  onChange={(e) => changeSearchKeyword(e)}
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={showFiltersModal}
              className="px-5 py-3 mb-2 mr-2 text-sm font-medium text-center text-blue-700 border border-blue-700 rounded-lg ml-7 hover:text-white hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:hover:bg-blue-600 dark:focus:ring-blue-800"
            >
              Filters
            </button>
          </div>
        </div>

        {/* body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate table-auto border-spacing-y-2 table-ylg">
            <thead>
              <tr>
                <th>User</th>
                <th>Wallet Address</th>
                <th>USD</th>
                <th>YLT</th>
                <th>TIMESTAMP</th>
                <th>TRANSACTION</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {swapTokenLogs ? (
                swapTokenLogs.map((swapTokenLog, i) => (
                  <tr key={i}>
                    <td>
                      <div className="td-avatar-group">
                        <Image
                          src={
                            swapTokenLog.user[0].profile_picture
                              ? swapTokenLog.user[0].profile_picture
                              : userDefaultAvatar
                          }
                          width={50}
                          height={50}
                          className="rounded-full bg-[#90e040] avatar-sm"
                          alt="profile picture"
                        />
                        <div className="px-2">
                          {swapTokenLog.user[0].nickname
                            ? swapTokenLog.user[0].nickname
                            : shortenAddress(swapTokenLog.address)}
                        </div>
                      </div>
                    </td>
                    <td>{shortenAddress(swapTokenLog.address)}</td>
                    <td>{swapTokenLog.token_amount}</td>
                    <td>{swapTokenLog.ylt_amount}</td>
                    <td>{dateFormat(swapTokenLog.createdAt)}</td>
                    <td>
                      <a href="#" className="ylg-link">
                        {swapTokenLog.token_type == 1 ? "Crypto" : "Stripe"}{" "}
                        {swapTokenLog.state == 1 && (
                          <Check2Circle className="inline-block" />
                        )}
                      </a>
                    </td>
                    <td>
                      {" "}
                      {swapTokenLog.state == 0 &&
                        swapTokenLog.token_type == 2 && (
                          <button
                            type="button"
                            onClick={() =>
                              changeSelectedId(swapTokenLog.objectId)
                            }
                            className={
                              selectedIds.includes(swapTokenLog.objectId)
                                ? "btn-primary uppercase"
                                : "btn-default uppercase"
                            }
                          >
                            {selectedIds.includes(swapTokenLog.objectId)
                              ? "Unselect"
                              : "Select"}
                          </button>
                        )}{" "}
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
        <div className="flex justify-between">
          <div className="flex">
            <div className="pt-1">
              {currentPage} / {lastPage}
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
              {currentPage < lastPage ? (
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
          <div className="flex">
            {selectedIds.length > 0 ? (
              <button onClick={transfer} className="btn-primary">
                Transfer
              </button>
            ) : (
              <button className="btn-primary" disabled>
                Transfer
              </button>
            )}
          </div>
        </div>
      </div>
      {toggleFiltersModal && (
        <FiltersModal
          onClose={filtersModalCloseHandler}
          changeUSDamountRange={changeUSDamountRange}
          USDamountRange={USDamountRange}
          filterByPaymentType={filterByPaymentType}
          paymentTypes={paymentTypes}
          filterByTransferState={filterByTransferState}
          transferState={transferState}
        />
      )}
    </div>
  );
}
