import { useCallback, useEffect, useState } from 'react'
import { paymentsApi } from '@/lib/api'
import { useToast } from './use-toast'

interface PaymentResponse {
  token: string
  snapUrl: string
  orderId: string
  donationId: string
  amount: number
  program: { id: string; title: string }
}

interface MidtransWindow extends Window {
  snap: {
    pay: (
      token: string,
      callbacks: {
        onSuccess: (result: unknown) => void
        onPending: (result: unknown) => void
        onError: (result: unknown) => void
        onClose: () => void
      },
    ) => void
  }
}

declare let window: MidtransWindow

export function useMidtrans() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load Midtrans Snap script if not already loaded
    if (!window.snap) {
      const script = document.createElement('script')
      script.src = 'https://app.sandbox.midtrans.com/snap/snap.js'
      script.async = true
      script.setAttribute('data-client-key', process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || '')
      document.head.appendChild(script)
    }
  }, [])

  const createPayment = useCallback(
    async (
      programId: string,
      amount: number,
      paymentMethod: string,
      isAnonymous: boolean,
      donorName?: string,
      donorEmail?: string,
    ) => {
      try {
        setIsLoading(true)

        // Call backend to create payment
        const response = (await paymentsApi.createPayment({
          programId,
          amount,
          paymentMethod,
          isAnonymous,
          donorName,
          donorEmail,
        })) as PaymentResponse

        if (!response || !response.token) {
          toast({
            title: 'Error',
            description: 'Failed to create payment',
            variant: 'destructive',
          })
          return false
        }

        // Open Midtrans Snap popup
        if (window.snap) {
          window.snap.pay(response.token, {
            onSuccess: function (result: unknown) {
              console.log('Payment success:', result)
              toast({
                title: 'Success',
                description: 'Payment successful! Redirecting...',
              })
              // Redirect to success page
              const successUrl = `/donate/success?order_id=${response.orderId}&program=${response.program.title}&amount=${amount}`
              window.location.href = successUrl
              return true
            },
            onPending: function (result: unknown) {
              console.log('Payment pending:', result)
              toast({
                title: 'Pending',
                description: 'Payment pending. Please complete the payment.',
              })
              // Redirect to instruction page
              const instructionUrl = `/donate/instruction?order_id=${response.orderId}&amount=${amount}`
              window.location.href = instructionUrl
              return true
            },
            onError: function (result: unknown) {
              console.log('Payment error:', result)
              toast({
                title: 'Error',
                description: 'Payment failed. Please try again.',
                variant: 'destructive',
              })
              return false
            },
            onClose: function () {
              console.log('Snap popup closed')
              toast({
                title: 'Cancelled',
                description: 'Payment cancelled',
              })
              return false
            },
          })
        } else {
          toast({
            title: 'Error',
            description: 'Midtrans Snap not loaded',
            variant: 'destructive',
          })
          return false
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to create payment'
        toast({
          title: 'Error',
          description: message,
          variant: 'destructive',
        })
        return false
      } finally {
        setIsLoading(false)
      }
    },
    [toast],
  )

  const checkPaymentStatus = useCallback(
    async (orderId: string): Promise<Record<string, unknown> | null> => {
      try {
        const response = (await paymentsApi.getStatus(
          orderId,
        )) as Record<string, unknown>
        return response
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to check payment status',
          variant: 'destructive',
        })
        return null
      }
    },
    [toast],
  )

  return {
    createPayment,
    checkPaymentStatus,
    isLoading,
  }
}
