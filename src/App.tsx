import { VStack, Button, Text, Spinner } from '@chakra-ui/react'
import { useAccount, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'
import MetaMaskConnect from './components/MetaMaskConnect'
import TokenBalances from './components/TokenBalances'

export default function App() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [hasProvider, setHasProvider] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const providerExists =
        typeof (window as unknown as { ethereum?: object }).ethereum !== 'undefined'
      setHasProvider(providerExists)
    }
  }, [])

  if (hasProvider === null) {
    return (
      <VStack gap={4} p={8}>
        <Spinner />
        <Text>Checking for wallet provider...</Text>
      </VStack>
    )
  }

  return (
    <VStack gap={6} p={8}>
      {isConnected ? (
        <>
          <Text>
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </Text>

          {/* ✅ Token balances display */}
          <TokenBalances walletAddress={address} />

          <Button onClick={() => disconnect()} colorScheme="red">
            Disconnect
          </Button>
        </>
      ) : (
        <MetaMaskConnect hasProvider={hasProvider} />
      )}
    </VStack>
  )
}
