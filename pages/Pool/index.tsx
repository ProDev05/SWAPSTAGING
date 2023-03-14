import React, { useContext, useMemo } from 'react'
import { ThemeContext } from 'styled-components'
import { Pair } from '@pancakeswap-libs/sdk'
import { Button, CardBody, Text } from '@pancakeswap-libs/uikit'
import Link from 'next/link'
import Question from '@/components/QuestionHelper'
import FullPositionCard from '@/components/PositionCard'
import { useTokenBalancesWithLoadingIndicator } from '@/state/wallet/hooks'
import { StyledInternalLink } from '@/components/Shared'
import { LightCard } from '@/components/Card'
import { RowBetween } from '@/components/Row'
import { AutoColumn } from '@/components/Column'
import CardNav from '@/components/CardNav'
import { useActiveWeb3React } from '@/hooks'
import { usePairs } from '../../data/Reserves'
import { toV2LiquidityToken, useTrackedTokenPairs } from '@/state/user/hooks'
import { Dots } from '@/components/swap/styleds'
import PageHeader from '@/components/PageHeader'
import AppBody from '../AppBody'

const BUSDTokenAddress = process.env.NEXT_PUBLIC_BUSDtokenAddress
const YLTTokenAddress = process.env.NEXT_PUBLIC_YLTtokenAddress

export default function Pool() {
  const theme = useContext(ThemeContext)
  const { account } = useActiveWeb3React()

  // fetch the user's balances of all tracked V2 LP tokens
  const trackedTokenPairs = useTrackedTokenPairs()
  const tokenPairsWithLiquidityTokens = useMemo(
    () => trackedTokenPairs.map((tokens) => ({ liquidityToken: toV2LiquidityToken(tokens), tokens })),
    [trackedTokenPairs]
  )
  const liquidityTokens = useMemo(() => tokenPairsWithLiquidityTokens.map((tpwlt) => tpwlt.liquidityToken), [
    tokenPairsWithLiquidityTokens,
  ])
  const [v2PairsBalances, fetchingV2PairBalances] = useTokenBalancesWithLoadingIndicator(
    account ?? undefined,
    liquidityTokens
  )

  // fetch the reserves for all V2 pools in which the user has a balance
  const liquidityTokensWithBalances = useMemo(
    () =>
      tokenPairsWithLiquidityTokens.filter(({ liquidityToken }) =>
        v2PairsBalances[liquidityToken.address]?.greaterThan('0')
      ),
    [tokenPairsWithLiquidityTokens, v2PairsBalances]
  )

  const v2Pairs = usePairs(liquidityTokensWithBalances.map(({ tokens }) => tokens))
  const v2IsLoading =
    fetchingV2PairBalances || v2Pairs?.length < liquidityTokensWithBalances.length || v2Pairs?.some((V2Pair) => !V2Pair)

  const allV2PairsWithLiquidity = v2Pairs.map(([, pair]) => pair).filter((v2Pair): v2Pair is Pair => Boolean(v2Pair))

  return (
    <>
      {/* <CardNav activeIndex={1} /> */}
      <AppBody>
        <PageHeader
          title={'Liquidity'}
          description={'Add liquidity to receive LP tokens'}
        >
          <Button id="join-pool-button">
            <Link href={`AddLiquidity/${BUSDTokenAddress}/${YLTTokenAddress}`}>Add Liquidity</Link>
          </Button>
        </PageHeader>
        <AutoColumn gap="lg" justify="center">
          <CardBody>
            <AutoColumn gap="12px" style={{ width: '100%' }}>
              <RowBetween padding="0 8px">
                <Text color={theme.colors.text}>{'Your Liquidity'}</Text>
                <Question
                  text={
                    'When you add liquidity, you are given pool tokens that represent your share. If you don’t see a pool you joined in this list, try importing a pool below.'
                  }
                />
              </RowBetween>
              {!account ? (
                <LightCard padding="40px">
                  <Text color="textDisabled" textAlign="center">
                    {'Connect to a wallet to view your liquidity.'}
                  </Text>
                </LightCard>
              ) : v2IsLoading ? (
                <LightCard padding="40px">
                  <Text color="textDisabled" textAlign="center">
                    <Dots>Loading</Dots>
                  </Text>
                </LightCard>
              ) : allV2PairsWithLiquidity?.length > 0 ? (
                <>
                  {allV2PairsWithLiquidity.map((v2Pair) => (
                    <FullPositionCard key={v2Pair.liquidityToken.address} pair={v2Pair} />
                  ))}
                </>
              ) : (
                <LightCard padding="40px">
                  <Text color="textDisabled" textAlign="center">
                    {'No liquidity found.'}
                  </Text>
                </LightCard>
              )}
            </AutoColumn>
          </CardBody>
        </AutoColumn>
      </AppBody>
    </>
  )
}
