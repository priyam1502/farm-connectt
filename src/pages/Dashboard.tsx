import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Package, ShoppingCart, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalListings: number;
  activeOrders: number;
  totalEarnings: number;
  pendingOrders: number;
}

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeOrders: 0,
    totalEarnings: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      if (profile.user_type === 'farmer') {
        // Fetch farmer stats
        const { data: produce } = await supabase
          .from('produce')
          .select('*')
          .eq('farmer_id', profile.id);

        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('farmer_id', profile.id);

        const totalEarnings = orders?.reduce((sum, order) => {
          return order.status === 'completed' ? sum + parseFloat(order.total_price.toString()) : sum;
        }, 0) || 0;

        const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
        const activeOrders = orders?.filter(order => ['accepted', 'pending'].includes(order.status)).length || 0;

        setStats({
          totalListings: produce?.length || 0,
          activeOrders,
          totalEarnings,
          pendingOrders
        });

        // Fetch recent orders with buyer info
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select(`
            *,
            buyer:buyer_id(full_name, phone, location),
            produce:produce_id(name, price_per_kg)
          `)
          .eq('farmer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(recentOrdersData || []);
      } else {
        // Fetch buyer stats
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('buyer_id', profile.id);

        const totalSpent = orders?.reduce((sum, order) => {
          return order.status === 'completed' ? sum + parseFloat(order.total_price.toString()) : sum;
        }, 0) || 0;

        const pendingOrders = orders?.filter(order => order.status === 'pending').length || 0;
        const activeOrders = orders?.filter(order => ['accepted', 'pending'].includes(order.status)).length || 0;

        setStats({
          totalListings: orders?.length || 0,
          activeOrders,
          totalEarnings: totalSpent,
          pendingOrders
        });

        // Fetch recent orders with farmer info
        const { data: recentOrdersData } = await supabase
          .from('orders')
          .select(`
            *,
            farmer:farmer_id(full_name, phone, location),
            produce:produce_id(name, price_per_kg)
          `)
          .eq('buyer_id', profile.id)
          .order('created_at', { ascending: false })
          .limit(5);

        setRecentOrders(recentOrdersData || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  const isFarmer = profile?.user_type === 'farmer';

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-muted-foreground">
            {isFarmer ? 'Manage your produce and orders' : 'Track your orders and discover fresh produce'}
          </p>
        </div>
        
        {isFarmer && (
          <Button onClick={() => navigate('/add-produce')} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Produce
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isFarmer ? 'Total Listings' : 'Total Orders'}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalListings}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeOrders}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-success">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {isFarmer ? 'Total Earnings' : 'Total Spent'}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{stats.totalEarnings.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No orders yet. {isFarmer ? 'Start by adding some produce!' : 'Browse available produce to place your first order.'}
            </p>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium">{order.produce?.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {isFarmer ? order.buyer?.full_name : order.farmer?.full_name} • 
                      {order.quantity_kg}kg • ₹{order.total_price}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      order.status === 'pending' ? 'bg-warning/20 text-warning' :
                      order.status === 'accepted' ? 'bg-success/20 text-success' :
                      order.status === 'completed' ? 'bg-primary/20 text-primary' :
                      'bg-destructive/20 text-destructive'
                    }`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;