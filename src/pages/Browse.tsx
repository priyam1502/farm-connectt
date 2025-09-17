import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Calendar, Leaf } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Produce {
  id: string;
  name: string;
  description: string;
  price_per_kg: number;
  quantity_kg: number;
  image_url?: string;
  location: string;
  harvest_date: string;
  farmer: {
    full_name: string;
    location: string;
    phone: string;
  };
}

const Browse = () => {
  const [produce, setProduce] = useState<Produce[]>([]);
  const [filteredProduce, setFilteredProduce] = useState<Produce[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProduce();
  }, []);

  useEffect(() => {
    filterProduce();
  }, [searchTerm, produce]);

  const fetchProduce = async () => {
    try {
      const { data, error } = await supabase
        .from('produce')
        .select(`
          *,
          farmer:farmer_id(full_name, location, phone)
        `)
        .eq('is_available', true)
        .gt('quantity_kg', 0)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching produce:', error);
        return;
      }

      setProduce(data || []);
    } catch (error) {
      console.error('Error fetching produce:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterProduce = () => {
    if (!searchTerm) {
      setFilteredProduce(produce);
      return;
    }

    const filtered = produce.filter(item =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.farmer.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    setFilteredProduce(filtered);
  };

  const handleOrder = (produceItem: Produce) => {
    if (!profile) {
      toast({
        title: "Please sign in",
        description: "You need to sign in to place an order.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (profile.user_type !== 'buyer') {
      toast({
        title: "Access restricted",
        description: "Only buyers can place orders.",
        variant: "destructive"
      });
      return;
    }

    navigate(`/order/${produceItem.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading fresh produce...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Fresh Produce Market</h1>
        <p className="text-muted-foreground">Discover fresh, locally grown produce directly from farmers</p>
      </div>

      {/* Search */}
      <div className="max-w-md mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search produce, location, or farmer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Produce Grid */}
      {filteredProduce.length === 0 ? (
        <div className="text-center py-12">
          <Leaf className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No produce found</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Try adjusting your search terms' : 'No fresh produce is available at the moment'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProduce.map((item) => (
            <Card key={item.id} className="overflow-hidden hover:shadow-medium transition-shadow">
              {item.image_url && (
                <div className="h-48 bg-muted relative">
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                  <Badge className="absolute top-2 right-2 bg-success text-success-foreground">
                    Fresh
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{item.name}</CardTitle>
                  <div className="text-right">
                    <div className="text-lg font-bold text-primary">₹{item.price_per_kg}/kg</div>
                    <div className="text-sm text-muted-foreground">{item.quantity_kg}kg available</div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {item.description && (
                  <p className="text-muted-foreground text-sm">{item.description}</p>
                )}
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{item.location}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Harvested: {new Date(item.harvest_date).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <p className="text-sm font-medium">Farmer: {item.farmer.full_name}</p>
                  <p className="text-xs text-muted-foreground">{item.farmer.location}</p>
                </div>
                
                <Button 
                  onClick={() => handleOrder(item)} 
                  className="w-full"
                  disabled={item.quantity_kg <= 0}
                >
                  {item.quantity_kg <= 0 ? 'Out of Stock' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Browse;