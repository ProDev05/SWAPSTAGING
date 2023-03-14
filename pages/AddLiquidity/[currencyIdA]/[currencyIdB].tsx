import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import AddLiquidity from '../index'

const RedirectDuplicateTokenIds = () => {
  const router = useRouter()
  const { currencyIdA, currencyIdB } = router.query

  const currencyId1: string = typeof currencyIdA === 'string' ? currencyIdA : currencyIdA[0];
  const currencyId2: string = typeof currencyIdB === 'string' ? currencyIdB : currencyIdB[0];

  if (currencyId1.toLowerCase() === currencyId2.toLowerCase()) {
    return <Link href={`/AddLiquidity/${currencyId1}`} />
  }
  return <AddLiquidity currencyIdA={currencyId1} currencyIdB={currencyId2} />
}

export default RedirectDuplicateTokenIds