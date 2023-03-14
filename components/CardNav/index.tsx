import React from 'react'
import styled from 'styled-components'
import Link from 'next/link'
import { ButtonMenu, ButtonMenuItem } from '@pancakeswap-libs/uikit'

const StyledNav = styled.div`
  margin-bottom: 40px;
`

function Nav({ activeIndex = 0 }: { activeIndex?: number }) {
  return (
    <StyledNav>
      <ButtonMenu activeIndex={activeIndex} scale="sm" variant="subtle">
        <ButtonMenuItem id="swap-nav-link">
          <Link href="/Swap">Swap</Link>
        </ButtonMenuItem>
        <ButtonMenuItem id="pool-nav-link">
          <Link href="Pool">Liquidity</Link>
        </ButtonMenuItem>
      </ButtonMenu>
    </StyledNav>
  )
}

export default Nav
