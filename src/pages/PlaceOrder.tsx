import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Package, User, MapPin } from "lucide-react";

interface Produce {
  id: string;
  name: string;
  description: string;
  price_per_kg: number;
  quantity_kg: number;
  image_url?: string;
  location: string;
  farmer: {
    id: string;
    full_name: string;
    location: string;
    phone: string;
  };
}

const PlaceOrder = () => {
  const { produceId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  
  const [produce, setProduce] = useState<Produce | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [orderData, setOrderData] = useState({
    quantity_kg: "",
    message: ""
  });

  useEffect(() => {
    if (produceId) {
      fetchProduce();
    }
  }, [produceId]);

  const fetchProduce = async () => {
    try {
      const { data, error } = await supabase
        .from('produce')
        .select(`
          *,
          farmer:farmer_id(id, full_name, location, phone)
        `)
        .eq('id', produceId)
        .eq('is_available', true)
        .single();

      if (error) {
        console.error('Error fetching produce:', error);
        toast({
          title: "Error",
          description: "Could not find the requested produce.",
          variant: "destructive"
        });
        navigate('/browse');
        return;
      }

      setProduce(data);
    } catch (error) {
      console.error('Error fetching produce:', error);
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || profile.user_type !== 'buyer') {
      toast({
        title: "Access denied",
        description: "Only buyers can place orders.",
        variant: "destructive"
      });
      return;
    }

    if (!produce) return;

    const quantity = parseFloat(orderData.quantity_kg);
    if (quantity <= 0 || quantity > produce.quantity_kg) {
      toast({
        title: "Invalid quantity",
        description: `Please enter a quantity between 1 and ${produce.quantity_kg} kg.`,
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);

    try {
      const totalPrice = quantity * produce.price_per_kg;

      const { error } = await supabase
        .from('orders')
        .insert({
          buyer_id: profile.id,
          farmer_id: produce.farmer.id,
          produce_id: produce.id,
          quantity_kg: quantity,
          total_price: totalPrice,
          buyer_message: orderData.message || null,
          status: 'pending'
        });

      if (error) {
        console.error('Error placing order:', error);
        toast({
          title: "Error",
          description: "Failed to place order. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Order placed successfully!",
        description: "The farmer will review your order and respond soon."
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error placing order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading produce details...</div>
      </div>
    );
  }

  if (!produce) {
    return null;
  }

  const quantity = parseFloat(orderData.quantity_kg) || 0;
  const totalPrice = quantity * produce.price_per_kg;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/browse')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Place Order</h1>
          <p className="text-muted-foreground">Review details and place your order</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Produce Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produce Details
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {produce.image_url && (
              <div className="w-full h-48 bg-muted rounded-lg overflow-hidden">
                <img
                  src={produce.image_url}
                  alt={produce.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div>
              <h3 className="text-xl font-semibold">{produce.name}</h3>
              <p className="text-2xl font-bold text-primary mt-1">₹{produce.price_per_kg}/kg</p>
            </div>
            
            {produce.description && (
              <p className="text-muted-foreground">{produce.description}</p>
            )}
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{produce.location}</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Available: {produce.quantity_kg}kg
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Farmer Details & Order Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Farmer Details
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <p className="font-medium">{produce.farmer.full_name}</p>
                <p className="text-sm text-muted-foreground">{produce.farmer.location}</p>
                <p className="text-sm text-muted-foreground">{produce.farmer.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity (kg) *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max={produce.quantity_kg}
                    value={orderData.quantity_kg}
                    onChange={(e) => setOrderData({...orderData, quantity_kg: e.target.value})}
                    placeholder="Enter quantity in kg"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Max available: {produce.quantity_kg}kg
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message to Farmer (optional)</Label>
                  <Textarea
                    id="message"
                    value={orderData.message}
                    onChange={(e) => setOrderData({...orderData, message: e.target.value})}
                    placeholder="Any special requirements or message..."
                    rows={3}
                  />
                </div>

                {quantity > 0 && (
                  <div className="bg-muted p-4 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Total Amount:</span>
                      <span className="text-2xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {quantity}kg × ₹{produce.price_per_kg}/kg
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <Button type="submit" disabled={submitting || quantity <= 0} className="flex-1">
                    {submitting ? "Placing Order..." : "Place Order"}
                  </Button>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/browse')}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrder;