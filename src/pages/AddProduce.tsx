import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PricePrediction } from "@/components/PricePrediction";
import { ArrowLeft, Plus } from "lucide-react";

const AddProduce = () => {
  const [loading, setLoading] = useState(false);
  const { profile } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price_per_kg: "",
    quantity_kg: "",
    location: profile?.location || "",
    harvest_date: new Date().toISOString().split('T')[0],
    image_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profile || profile.user_type !== 'farmer') {
      toast({
        title: "Access denied",
        description: "Only farmers can add produce.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('produce')
        .insert({
          farmer_id: profile.id,
          name: formData.name,
          description: formData.description,
          price_per_kg: parseFloat(formData.price_per_kg),
          quantity_kg: parseFloat(formData.quantity_kg),
          location: formData.location,
          harvest_date: formData.harvest_date,
          image_url: formData.image_url || null
        });

      if (error) {
        console.error('Error adding produce:', error);
        toast({
          title: "Error",
          description: "Failed to add produce. Please try again.",
          variant: "destructive"
        });
        return;
      }

      toast({
        title: "Success!",
        description: "Your produce has been added to the market."
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Error adding produce:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Add New Produce</h1>
          <p className="text-muted-foreground">List your fresh produce for buyers</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Produce Details
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Produce Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Fresh Tomatoes"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="City, State"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe your produce quality, variety, farming methods..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="price">Price per KG (₹) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price_per_kg}
                  onChange={(e) => setFormData({...formData, price_per_kg: e.target.value})}
                  placeholder="25.00"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity">Available Quantity (KG) *</Label>
                <Input
                  id="quantity"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.quantity_kg}
                  onChange={(e) => setFormData({...formData, quantity_kg: e.target.value})}
                  placeholder="100"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="harvest_date">Harvest Date *</Label>
              <Input
                id="harvest_date"
                type="date"
                value={formData.harvest_date}
                onChange={(e) => setFormData({...formData, harvest_date: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL (optional)</Label>
              <Input
                id="image_url"
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-xs text-muted-foreground">
                Add a photo URL of your produce to attract more buyers
              </p>
            </div>

            {formData.name && formData.location && formData.price_per_kg && formData.quantity_kg && (
              <PricePrediction
                cropName={formData.name}
                location={formData.location}
                currentPrice={parseFloat(formData.price_per_kg)}
                quantity={parseFloat(formData.quantity_kg)}
              />
            )}

            <div className="flex gap-4 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? "Adding Produce..." : "Add Produce"}
              </Button>
              
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/dashboard')}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddProduce;