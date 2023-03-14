import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TransfersForm from "../components/TransfersForm";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useMoralis } from "react-moralis";
import Preloader from "../components/Preloader/Preloader";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useMoralis()
  const router = useRouter()

  useEffect(() => {
    if (!user.get("isSuperAdmin")) {
      router.push('/')
    }
    setIsLoading(false)
  }, [user])

  return (
    <>
      {isLoading && <Preloader />}
      <div className="min-h-screen w-full relative overflow-x-hidden mx-auto flex flex-col pt-6">
        <Navbar setIsLoading={setIsLoading} />

        <TransfersForm setIsLoading={setIsLoading} />

        {/* Footer */}
        <Footer />
      </div>
    </>
  );
}
