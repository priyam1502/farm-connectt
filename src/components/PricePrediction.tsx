import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { TrendingUp, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface PricePredictionProps {
  cropName: string;
  location: string;
  currentPrice: number;
  quantity: number;
}

interface Prediction {
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  recommendation: 'sell_now' | 'wait_1_week' | 'wait_2_weeks';
  demandLevel: 'high' | 'medium' | 'low';
  reasoning: string;
}

export const PricePrediction = ({ cropName, location, currentPrice, quantity }: PricePredictionProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);

  const getPricePrediction = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-price', {
        body: { cropName, location, currentPrice, quantity }
      });

      if (error) throw error;

      setPrediction(data.prediction);
      toast({
        title: 'Price Prediction Ready',
        description: 'AI analysis complete!',
      });
    } catch (error) {
      console.error('Error getting prediction:', error);
      toast({
        title: 'Prediction Failed',
        description: 'Could not get price prediction. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getRecommendationText = (rec: string) => {
    switch (rec) {
      case 'sell_now': return '🟢 Sell Now - Market is favorable';
      case 'wait_1_week': return '🟡 Wait 1 Week - Prices may improve';
      case 'wait_2_weeks': return '🟠 Wait 2 Weeks - Better prices expected';
      default: return rec;
    }
  };

  const getDemandColor = (level: string) => {
    switch (level) {
      case 'high': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-4">
      {!prediction ? (
        <Button
          onClick={getPricePrediction}
          disabled={loading}
          variant="outline"
          className="w-full gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing Market...
            </>
          ) : (
            <>
              <TrendingUp className="h-4 w-4" />
              Get AI Price Prediction
            </>
          )}
        </Button>
      ) : (
        <Card className="p-4 space-y-3 bg-gradient-to-br from-primary/5 to-primary/10">
          <div className="flex items-center gap-2 font-semibold text-primary">
            <TrendingUp className="h-5 w-5" />
            AI Market Analysis
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Suggested Price Range:</span>
              <span className="font-bold text-lg">
                ₹{prediction.suggestedPriceMin} - ₹{prediction.suggestedPriceMax}/kg
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Market Demand:</span>
              <span className={`font-semibold uppercase ${getDemandColor(prediction.demandLevel)}`}>
                {prediction.demandLevel}
              </span>
            </div>

            <div className="border-t pt-2">
              <p className="text-sm font-medium mb-1">
                {getRecommendationText(prediction.recommendation)}
              </p>
              <p className="text-xs text-muted-foreground">
                {prediction.reasoning}
              </p>
            </div>
          </div>

          <Button
            onClick={getPricePrediction}
            variant="ghost"
            size="sm"
            className="w-full"
          >
            Refresh Analysis
          </Button>
        </Card>
      )}
    </div>
  );
};
