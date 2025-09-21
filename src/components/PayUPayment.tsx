import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface PayUPaymentProps {
  amount: number;
  orderId: string;
  buyerInfo: {
    name: string;
    email: string;
    phone: string;
  };
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentFailure: (error: any) => void;
}

const PayUPayment = ({ 
  amount, 
  orderId, 
  buyerInfo, 
  onPaymentSuccess, 
  onPaymentFailure 
}: PayUPaymentProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const initiatePayment = async () => {
    setIsProcessing(true);
    
    try {
      const txnid = `TXN${Date.now()}`;
      const productinfo = `Order ${orderId}`;
      const firstname = buyerInfo.name.split(' ')[0];
      const email = buyerInfo.email;
      
      // Call secure edge function to generate hash
      const { data: paymentData, error } = await supabase.functions.invoke('generate-payu-hash', {
        body: {
          txnid,
          amount: amount.toString(),
          productinfo,
          firstname,
          email
        }
      });

      if (error || !paymentData) {
        throw new Error('Failed to generate payment hash');
      }

      // Create form for PayU
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = 'https://test.payu.in/_payment'; // Use https://secure.payu.in/_payment for production
      form.style.display = 'none';

      const formData = {
        key: paymentData.key,
        txnid: paymentData.txnid,
        amount: paymentData.amount,
        productinfo: paymentData.productinfo,
        firstname: paymentData.firstname,
        email: paymentData.email,
        phone: buyerInfo.phone,
        surl: `${window.location.origin}/payment-success`,
        furl: `${window.location.origin}/payment-failure`,
        hash: paymentData.hash,
        service_provider: 'payu_paisa'
      };

      Object.entries(formData).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();

    } catch (error) {
      console.error('Payment error:', error);
      onPaymentFailure(error);
      toast({
        title: "Payment Error",
        description: "Failed to initiate payment. Please try again.",
        variant: "destructive"
      });
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          PayU Payment Gateway
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Total Amount:</span>
            <span className="text-lg font-bold">₹{amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Order ID:</span>
            <span className="text-sm font-mono">{orderId}</span>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <Label htmlFor="buyer-name">Name</Label>
            <Input
              id="buyer-name"
              value={buyerInfo.name}
              readOnly
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="buyer-email">Email</Label>
            <Input
              id="buyer-email"
              value={buyerInfo.email}
              readOnly
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="buyer-phone">Phone</Label>
            <Input
              id="buyer-phone"
              value={buyerInfo.phone}
              readOnly
              className="bg-muted"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Shield className="h-4 w-4" />
          <span>Secured by PayU</span>
        </div>

        <Button
          onClick={initiatePayment}
          disabled={isProcessing}
          className="w-full"
          size="lg"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
              Processing Payment...
            </>
          ) : (
            `Pay ₹${amount.toFixed(2)}`
          )}
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          By proceeding, you agree to our terms and conditions. 
          This is a demo implementation using PayU test environment.
        </p>
      </CardContent>
    </Card>
  );
};

export default PayUPayment;