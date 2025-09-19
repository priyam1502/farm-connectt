import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ProductRating from "@/components/ProductRating";
import PayUPayment from "@/components/PayUPayment";
import { MapPin, Calendar, User, Star, ArrowLeft } from "lucide-react";

interface Produce {
  id: string;
  name: string;
  description: string;
  price_per_kg: number;
  quantity_kg: number;
  harvest_date: string;
  location: string;
  image_url: string;
  average_rating: number;
  total_ratings: number;
  profiles: {
    id: string;
    full_name: string;
    phone: string;
    user_id: string;
  };
}

interface Rating {
  id: string;
  user_id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

const PlaceOrder = () => {
  const { produceId } = useParams();
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { toast } = useToast();

  const [produce, setProduce] = useState<Produce | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  const [orderData, setOrderData] = useState({
    quantity_kg: 1,
    buyer_message: ""
  });

  const [activeTab, setActiveTab] = useState("details");
  const [paymentMode, setPaymentMode] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState("");

  useEffect(() => {
    if (produceId) {
      fetchProduceDetails();
      fetchRatings();
    }
  }, [produceId]);

  const fetchProduceDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('produce')
        .select(`
          *,
          profiles:farmer_id (
            id,
            full_name,
            phone,
            user_id
          )
        `)
        .eq('id', produceId)
        .eq('is_available', true)
        .single();

      if (error) throw error;
      setProduce(data as Produce);
    } catch (error) {
      console.error('Error fetching produce:', error);
      toast({
        title: "Product not found",
        description: "The requested product could not be found.",
        variant: "destructive"
      });
      navigate('/browse');
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from('ratings')
        .select(`
          *,
          profiles!ratings_user_id_fkey (
            full_name
          )
        `)
        .eq('produce_id', produceId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRatings(data as Rating[]);
    } catch (error) {
      console.error('Error fetching ratings:', error);
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

    const quantity = orderData.quantity_kg;
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
      const orderId = `ORD${Date.now()}`;

      const { error } = await supabase
        .from('orders')
        .insert({
          buyer_id: profile.id,
          farmer_id: produce.profiles.id,
          produce_id: produce.id,
          quantity_kg: quantity,
          total_price: totalPrice,
          buyer_message: orderData.buyer_message || null,
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

      setCurrentOrderId(orderId);
      setPaymentMode(true);
      setActiveTab("payment");

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

  const handlePaymentSuccess = (paymentData: any) => {
    toast({
      title: "Payment Successful!",
      description: "Your order has been confirmed and the farmer will be notified."
    });
    navigate('/orders');
  };

  const handlePaymentFailure = (error: any) => {
    toast({
      title: "Payment Failed",
      description: "Your order is saved but payment failed. You can retry payment from your orders page.",
      variant: "destructive"
    });
    navigate('/orders');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-muted-foreground">Loading product details...</div>
      </div>
    );
  }

  if (!produce) {
    return null;
  }

  const totalPrice = orderData.quantity_kg * produce.price_per_kg;
  const canRate = profile?.user_type === 'buyer' && user;
  const hasUserRated = ratings.some(rating => rating.user_id === user?.id);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/browse')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">{produce.name}</h1>
          <p className="text-muted-foreground">Product details and ordering</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="details">Product Details</TabsTrigger>
          <TabsTrigger value="ratings">Reviews & Ratings</TabsTrigger>
          <TabsTrigger value="payment" disabled={!paymentMode}>Payment</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Product Details */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-2xl">{produce.name}</CardTitle>
                  {produce.total_ratings > 0 && (
                    <div className="flex items-center gap-1">
                      <Star className="h-5 w-5 text-yellow-500 fill-current" />
                      <span className="text-lg font-medium">{produce.average_rating.toFixed(1)}</span>
                      <span className="text-sm text-muted-foreground">({produce.total_ratings} reviews)</span>
                    </div>
                  )}
                </div>
                <div className="text-3xl font-bold text-primary">₹{produce.price_per_kg}/kg</div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="aspect-video relative rounded-lg overflow-hidden">
                  <img
                    src={produce.image_url || '/placeholder.svg'}
                    alt={produce.name}
                    className="object-cover w-full h-full"
                  />
                  <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                    Fresh
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  {produce.description && (
                    <p className="text-muted-foreground">{produce.description}</p>
                  )}
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{produce.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Harvested: {new Date(produce.harvest_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Farmer: {produce.profiles.full_name}</span>
                    </div>
                  </div>
                  
                  <div className="text-lg font-medium">
                    Available: {produce.quantity_kg} kg
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Order Form */}
            <Card>
              <CardHeader>
                <CardTitle>Place Your Order</CardTitle>
                <CardDescription>Fill in the details to place your order</CardDescription>
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
                      onChange={(e) => setOrderData({...orderData, quantity_kg: parseFloat(e.target.value) || 1})}
                      placeholder="Enter quantity"
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
                      value={orderData.buyer_message}
                      onChange={(e) => setOrderData({...orderData, buyer_message: e.target.value})}
                      placeholder="Any special requirements or message..."
                      rows={3}
                    />
                  </div>

                  {orderData.quantity_kg > 0 && (
                    <div className="bg-muted p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">Total Amount:</span>
                        <span className="text-2xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {orderData.quantity_kg}kg × ₹{produce.price_per_kg}/kg
                      </p>
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    disabled={submitting || orderData.quantity_kg <= 0} 
                    className="w-full"
                    size="lg"
                  >
                    {submitting ? "Processing..." : "Proceed to Payment"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ratings" className="space-y-6">
          <ProductRating
            produceId={produce.id}
            ratings={ratings}
            averageRating={produce.average_rating}
            totalRatings={produce.total_ratings}
            canRate={canRate && !hasUserRated}
            onRatingSubmitted={fetchRatings}
          />
        </TabsContent>

        <TabsContent value="payment" className="space-y-6">
          {paymentMode && (
            <PayUPayment
              amount={totalPrice}
              orderId={currentOrderId}
              buyerInfo={{
                name: profile?.full_name || 'Buyer',
                email: user?.email || 'buyer@example.com',
                phone: profile?.phone || '1234567890'
              }}
              onPaymentSuccess={handlePaymentSuccess}
              onPaymentFailure={handlePaymentFailure}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlaceOrder;