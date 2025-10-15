import { VStack, Button, Text, Link } from '@chakra-ui/react'
import { useConnect } from 'wagmi'
import type { Connector } from '@wagmi/core'
import { useState } from 'react'

interface MetaMaskConnectProps {
  hasProvider: boolean
}

export default function MetaMaskConnect({ hasProvider }: MetaMaskConnectProps) {
  const { connectors, connectAsync, isPending } = useConnect()
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleConnect = async (connector: Connector) => {
    setErrorMsg(null)
    try {
      if (!hasProvider) throw new Error('No wallet provider found.')
      await connectAsync({ connector })
    } catch (err) {
      console.error('Wallet connect error:', err)
      if (err instanceof Error) setErrorMsg(err.message)
      else setErrorMsg('An unknown error occurred.')
    }
  }

  return (
    <VStack gap={4} p={8}>
      {hasProvider ? (
        <>
          {connectors
            .filter(
              (connector, index, self) =>
                index === self.findIndex((c) => c.name === connector.name)
            )
            .map((connector) => {
              const label =
                connector.name === 'Injected' ? 'MetaMask' : connector.name
              return (
                <Button
                  key={connector.uid}
                  onClick={() => handleConnect(connector)}
                  loading={isPending}
                  colorScheme="teal"
                >
                  Connect {label}
                </Button>
              )
            })}

          {errorMsg && <Text color="red.400">{errorMsg}</Text>}
        </>
      ) : (
        <>
          <Text>No wallet provider detected</Text>
          <Link
            href="https://metamask.io/download/"
            target="_blank"
            rel="noopener noreferrer"
            color="teal.400"
            fontWeight="bold"
          >
            Install MetaMask
          </Link>
        </>
      )}
    </VStack>
  )
}
