import { useCallback, useEffect, useState } from 'react'
import { VStack, HStack, Text, Spinner, Button } from '@chakra-ui/react'
import { formatUnits } from 'viem'
import { Alchemy, Network } from 'alchemy-sdk'

interface TokenBalance {
  contractAddress: string
  symbol: string
  balance: string
}

interface Props {
  walletAddress?: `0x${string}`
  pollIntervalMs?: number
}

export default function TokenBalances({ walletAddress, pollIntervalMs = 15000 }: Props) {
  const [balances, setBalances] = useState<TokenBalance[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setErrorMsg] = useState<string | null>(null)

  const fetchBalances = useCallback(async () => {
    if (!walletAddress) return

    // Initialize Alchemy
    const alchemy = new Alchemy({
      apiKey: import.meta.env.VITE_ALCHEMY_API_KEY,
      network: Network.ETH_MAINNET, // or Network.ETH_GOERLI for testnet
    })

    setLoading(true)
    setErrorMsg(null)

    try {
      const response = await alchemy.core.getTokenBalances(walletAddress)
      const nonZeroTokens = response.tokenBalances.filter((t) => t.tokenBalance !== '0')
      const tokenData = await Promise.all(
        nonZeroTokens.map(async (t) => {
          const metadata = await alchemy.core.getTokenMetadata(t.contractAddress)
          const balance = t.tokenBalance
          const formatted = formatUnits(
            balance ? BigInt(balance) : 0n, // fallback to 0n if null
            metadata.decimals ?? 18
          )
          return {
            contractAddress: t.contractAddress,
            symbol: metadata.symbol ?? 'TOKEN',
            balance: formatted,
          }
        })
      )
      setBalances(tokenData)
    } catch (err) {
      console.error('Error fetching token balances', err)
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Unknown error')
      }
    } finally {
      setLoading(false)
    }
  }, [walletAddress])

  useEffect(() => {
    if (!walletAddress) return
    fetchBalances()
    const interval = setInterval(fetchBalances, pollIntervalMs)
    return () => clearInterval(interval)
  }, [walletAddress, fetchBalances, pollIntervalMs])

  return (
    <VStack gap={3} align="stretch" p={4} border="1px solid" borderColor="gray.200" borderRadius="md">
      <HStack justify="space-between">
        <Text fontWeight="bold">Token</Text>
        <Text fontWeight="bold">Balance</Text>
      </HStack>

      {loading && (
        <HStack>
          <Spinner size="sm" />
          <Text>Fetching balances…</Text>
        </HStack>
      )}

      {error && <Text color="red.500">{error}</Text>}

      {!loading && balances.length === 0 && <Text>No tokens found.</Text>}

      {balances.map((t) => (
        <HStack key={t.contractAddress} justify="space-between">
          <Text>{t.symbol}</Text>
          <Text fontFamily="mono">{Number(t.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</Text>
        </HStack>
      ))}

      <Button size="sm" colorScheme="teal" onClick={fetchBalances}>
        Refresh
      </Button>
    </VStack>
  )
}
