import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Package } from "lucide-react";

interface Order {
  id: string;
  quantity_kg: number;
  total_price: number;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  buyer_message?: string;
  farmer_message?: string;
  created_at: string;
  buyer?: {
    full_name: string;
    phone: string;
    location: string;
  };
  farmer?: {
    full_name: string;
    phone: string;
    location: string;
  };
  produce: {
    name: string;
    price_per_kg: number;
    image_url?: string;
  };
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchOrders();
  }, [profile]);

  const fetchOrders = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          buyer:buyer_id(full_name, phone, location),
          farmer:farmer_id(full_name, phone, location),
          produce:produce_id(name, price_per_kg, image_url)
        `)
        .or(`buyer_id.eq.${profile.id},farmer_id.eq.${profile.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        return;
      }

      setOrders((data as any) || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', orderId);

      if (error) {
        console.error('Error updating order:', error);
        toast({
          title: "Error",
          description: "Failed to update order status.",
          variant: "destructive"
        });
        return;
      }

      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));

      toast({
        title: "Order updated",
        description: `Order has been ${status}.`
      });
    } catch (error) {
      console.error('Error updating order:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-warning/20 text-warning';
      case 'accepted': return 'bg-success/20 text-success';
      case 'completed': return 'bg-primary/20 text-primary';
      case 'rejected': return 'bg-destructive/20 text-destructive';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <Package className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading orders...</div>
      </div>
    );
  }

  const isFarmer = profile?.user_type === 'farmer';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Orders</h1>
        <p className="text-muted-foreground">
          {isFarmer ? 'Manage incoming orders from buyers' : 'Track your orders and their status'}
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No orders yet</h3>
            <p className="text-muted-foreground">
              {isFarmer 
                ? 'Orders from buyers will appear here once they start purchasing your produce.'
                : 'Your orders will appear here once you start purchasing from farmers.'
              }
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Order Info */}
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{order.produce.name}</h3>
                      <Badge className={getStatusColor(order.status)}>
                        {getStatusIcon(order.status)}
                        <span className="ml-1">{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Quantity:</p>
                        <p className="font-medium">{order.quantity_kg}kg</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Total Price:</p>
                        <p className="font-medium text-primary">₹{order.total_price}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">{isFarmer ? 'Buyer:' : 'Farmer:'}</p>
                        <p className="font-medium">
                          {isFarmer ? order.buyer?.full_name : order.farmer?.full_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {isFarmer ? order.buyer?.phone : order.farmer?.phone}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Order Date:</p>
                        <p className="font-medium">{new Date(order.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {order.buyer_message && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium">Buyer Message:</p>
                        <p className="text-sm text-muted-foreground">{order.buyer_message}</p>
                      </div>
                    )}

                    {order.farmer_message && (
                      <div className="bg-muted p-3 rounded-lg">
                        <p className="text-sm font-medium">Farmer Response:</p>
                        <p className="text-sm text-muted-foreground">{order.farmer_message}</p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons for Farmers */}
                  {isFarmer && order.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'accepted')}
                        className="bg-success hover:bg-success/90 text-success-foreground"
                      >
                        Accept Order
                      </Button>
                      <Button
                        onClick={() => updateOrderStatus(order.id, 'rejected')}
                        variant="destructive"
                      >
                        Reject Order
                      </Button>
                    </div>
                  )}

                  {/* Complete Order Button for Farmers */}
                  {isFarmer && order.status === 'accepted' && (
                    <Button
                      onClick={() => updateOrderStatus(order.id, 'completed')}
                      variant="outline"
                    >
                      Mark as Completed
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;