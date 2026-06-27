"use client";

import { useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Loader2, CreditCard, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { stripeService } from "@/lib/services/stripe.service";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
);

interface StripeCardStepProps {
  paymentId: string;
  amount: number;
  onSuccess: () => void;
  onBack: () => void;
}

export function StripeCardStep(props: StripeCardStepProps) {
  return (
    <Elements stripe={stripePromise}>
      <StripeCardForm {...props} />
    </Elements>
  );
}

function StripeCardForm({
  paymentId,
  amount,
  onSuccess,
  onBack,
}: StripeCardStepProps) {
  const stripe = useStripe();
  const elements = useElements();

  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    stripeService
      .createPaymentIntent(paymentId)
      .then((res) => setClientSecret(res.data.clientSecret))
      .catch((err) =>
        setError(err.message ?? "Error al iniciar el pago. Intenta de nuevo."),
      )
      .finally(() => setIsLoadingIntent(false));
  }, [paymentId]);

  const handleConfirm = async () => {
    if (!stripe || !elements || !clientSecret) return;
    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    setIsConfirming(true);
    setError(null);

    const { error: stripeError } = await stripe.confirmCardPayment(
      clientSecret,
      { payment_method: { card: cardElement } },
    );

    if (stripeError) {
      setError(stripeError.message ?? "Error al procesar el pago.");
      setIsConfirming(false);
    } else {
      onSuccess();
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-xl bg-secondary/50 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CreditCard className="h-4 w-4" />
          <span>Total a pagar</span>
        </div>
        <span className="text-lg font-bold text-primary">
          ${amount.toFixed(2)} USD
        </span>
      </div>

      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground mb-2">
          Datos de Tarjeta
        </p>
        {isLoadingIntent ? (
          <div className="flex items-center justify-center h-12 rounded-lg border border-input bg-background">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="rounded-lg border border-input bg-background px-3 py-3">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "15px",
                    color: "hsl(var(--foreground))",
                    "::placeholder": {
                      color: "hsl(var(--muted-foreground))",
                    },
                  },
                  invalid: {
                    color: "hsl(var(--destructive))",
                  },
                },
                hidePostalCode: true,
              }}
            />
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-destructive rounded-lg bg-destructive/10 px-3 py-2">
          {error}
        </p>
      )}

      <p className="text-xs text-muted-foreground flex items-center gap-1">
        <Lock className="h-3 w-3" />
        Pago procesado de forma segura por Stripe. No almacenamos datos de tu
        tarjeta.
      </p>

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1 h-11"
          onClick={onBack}
          disabled={isConfirming}
        >
          Volver
        </Button>
        <Button
          className="flex-1 h-11"
          onClick={handleConfirm}
          disabled={!clientSecret || isConfirming || isLoadingIntent}
        >
          {isConfirming ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            "Pagar"
          )}
        </Button>
      </div>
    </div>
  );
}
