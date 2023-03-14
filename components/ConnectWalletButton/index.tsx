import React from 'react'
import { Button, ButtonProps, useWalletModal } from '@pancakeswap-libs/uikit'
import useAuth from '@/hooks/useAuth'

const UnlockButton: React.FC<ButtonProps> = (props) => {
  const { login, logout } = useAuth()
  const { onPresentConnectModal } = useWalletModal(login, logout)

  return (
    <Button onClick={onPresentConnectModal} {...props}>
      {'Unlock Wallet'}
    </Button>
  )
}

export default UnlockButton
