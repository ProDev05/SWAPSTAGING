import React from 'react'
import { useRouter } from 'next/router'
import AddLiquidity from './index'
import Link from 'next/link'

const OLD_PATH_STRUCTURE = /^(0x[a-fA-F0-9]{40})-(0x[a-fA-F0-9]{40})$/
const RedirectOldAddLiquidityPathStructure = () => {

  const router = useRouter()
  const { currencyIdA } = router.query

  let currencyId: string = typeof currencyIdA === 'string' ? currencyIdA : currencyIdA[0];

  const match = currencyId.match(OLD_PATH_STRUCTURE)
  if (match?.length) {
    return <Link href={`/AddLiquidity/${match[1]}/${match[2]}`} />
  }

  return <AddLiquidity currencyIdA={currencyId} />
}

export default RedirectOldAddLiquidityPathStructure