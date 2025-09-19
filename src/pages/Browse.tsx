import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Calendar, Star, ShoppingCart } from "lucide-react";

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
    full_name: string;
    phone: string;
  };
}

const Browse = () => {
  const [produce, setProduce] = useState<Produce[]>([]);
  const [filteredProduce, setFilteredProduce] = useState<Produce[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [sortBy, setSortBy] = useState("name");
  
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchProduce();
  }, []);

  useEffect(() => {
    filterAndSortProduce();
  }, [produce, searchTerm, locationFilter, sortBy]);

  const fetchProduce = async () => {
    try {
      const { data, error } = await supabase
        .from('produce')
        .select(`
          *,
          profiles:farmer_id (
            full_name,
            phone
          )
        `)
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProduce(data as Produce[]);
    } catch (error) {
      console.error('Error fetching produce:', error);
      toast({
        title: "Error loading produce",
        description: "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortProduce = () => {
    let filtered = produce.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !locationFilter || 
                             item.location.toLowerCase().includes(locationFilter.toLowerCase());
      return matchesSearch && matchesLocation;
    });

    // Sort produce
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price_low':
          return a.price_per_kg - b.price_per_kg;
        case 'price_high':
          return b.price_per_kg - a.price_per_kg;
        case 'rating':
          return b.average_rating - a.average_rating;
        case 'recent':
          return new Date(b.harvest_date).getTime() - new Date(a.harvest_date).getTime();
        default:
          return a.name.localeCompare(b.name);
      }
    });

    setFilteredProduce(filtered);
  };

  const handleOrderClick = (produceId: string) => {
    if (!profile) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to place an order.",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    if (profile.user_type === 'farmer') {
      toast({
        title: "Farmers cannot place orders",
        description: "Only buyers can place orders for produce.",
        variant: "destructive"
      });
      return;
    }

    navigate(`/order/${produceId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-muted-foreground">Loading fresh produce...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Browse Fresh Produce</h1>
        <p className="text-muted-foreground">
          Discover fresh, local produce directly from farmers
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search produce..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Input
          placeholder="Filter by location..."
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
        />
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="price_low">Price (Low to High)</SelectItem>
            <SelectItem value="price_high">Price (High to Low)</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
            <SelectItem value="recent">Recently Harvested</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="text-sm text-muted-foreground flex items-center">
          {filteredProduce.length} item{filteredProduce.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {/* Produce Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProduce.map((item) => (
          <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="aspect-video relative">
              <img
                src={item.image_url || '/placeholder.svg'}
                alt={item.name}
                className="object-cover w-full h-full"
              />
              <Badge className="absolute top-2 right-2 bg-background/80 text-foreground">
                ₹{item.price_per_kg}/kg
              </Badge>
            </div>
            
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">{item.name}</CardTitle>
                {item.total_ratings > 0 && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    <span className="text-sm font-medium">{item.average_rating.toFixed(1)}</span>
                    <span className="text-xs text-muted-foreground">({item.total_ratings})</span>
                  </div>
                )}
              </div>
              <CardDescription>{item.description}</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Harvested: {new Date(item.harvest_date).toLocaleDateString()}</span>
                </div>
                <div className="font-medium">
                  Available: {item.quantity_kg} kg
                </div>
                <div className="text-sm text-muted-foreground">
                  Farmer: {item.profiles.full_name}
                </div>
              </div>
              
              <Button 
                onClick={() => handleOrderClick(item.id)}
                className="w-full"
                disabled={item.quantity_kg === 0}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {item.quantity_kg === 0 ? 'Out of Stock' : 'Order Now'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProduce.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground mb-4">No produce found matching your criteria.</div>
          <Button variant="outline" onClick={() => {
            setSearchTerm("");
            setLocationFilter("");
            setSortBy("name");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};

export default Browse;