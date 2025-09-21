import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { txnid, amount, productinfo, firstname, email } = await req.json();

    // Validate required fields
    if (!txnid || !amount || !productinfo || !firstname || !email) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // PayU configuration (these should be set as Supabase secrets)
    const PAYU_MERCHANT_KEY = Deno.env.get('PAYU_MERCHANT_KEY');
    const PAYU_SALT = Deno.env.get('PAYU_SALT');

    if (!PAYU_MERCHANT_KEY || !PAYU_SALT) {
      console.error('PayU credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate hash string
    const hashString = `${PAYU_MERCHANT_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;

    // Generate SHA-512 hash
    const encoder = new TextEncoder();
    const data = encoder.encode(hashString);
    const hashBuffer = await crypto.subtle.digest('SHA-512', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    console.log('Payment hash generated successfully for transaction:', txnid);

    return new Response(
      JSON.stringify({ 
        hash,
        key: PAYU_MERCHANT_KEY,
        txnid,
        amount,
        productinfo,
        firstname,
        email
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error generating PayU hash:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to generate payment hash' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});