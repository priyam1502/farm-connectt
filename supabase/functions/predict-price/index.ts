import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cropName, location, currentPrice, quantity } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    const prompt = `As an agricultural market analyst, provide price prediction for:
Crop: ${cropName}
Location: ${location}
Current Price: ₹${currentPrice}/kg
Quantity: ${quantity}kg

Provide:
1. Fair market price range for this crop in ${location}
2. Best time to sell (immediate/wait 1 week/wait 2 weeks)
3. Market demand analysis
4. Brief price trend explanation

Format as JSON:
{
  "suggestedPriceMin": number,
  "suggestedPriceMax": number,
  "recommendation": "sell_now" | "wait_1_week" | "wait_2_weeks",
  "demandLevel": "high" | "medium" | "low",
  "reasoning": "brief explanation"
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: 'You are an agricultural market analyst with expertise in Indian crop pricing. Respond only with valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error('Failed to get price prediction');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    // Parse JSON response
    const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
    const prediction = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (!prediction) {
      throw new Error('Invalid AI response format');
    }

    return new Response(
      JSON.stringify({ prediction }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
