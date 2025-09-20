import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  Leaf, 
  ArrowRight,
  CheckCircle,
  Phone,
  MapPin,
  Clock
} from "lucide-react";
import heroImage from "@/assets/hero-farm.jpg";

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const features = [
    {
      icon: Users,
      title: "Direct Connection",
      description: "Connect farmers directly with buyers, eliminating middlemen and ensuring fair prices"
    },
    {
      icon: ShoppingCart,
      title: "Easy Ordering",
      description: "Simple and intuitive ordering process for fresh produce straight from the farm"
    },
    {
      icon: TrendingUp,
      title: "Better Profits",
      description: "Farmers earn more while buyers get better prices through direct trade"
    },
    {
      icon: Leaf,
      title: "Fresh Produce",
      description: "Get the freshest produce directly from local farmers in your area"
    }
  ];


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left animate-fade-in">
              <Badge variant="secondary" className="mb-6 px-4 py-2">
                🌱 Connecting Farms to Tables
              </Badge>
              <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 leading-tight">
                Fresh Produce
                <span className="block text-gradient bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  Direct from Farms
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
                Join India's largest farmers' marketplace. Get fresh produce directly from farmers 
                or sell your harvest at the best prices.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 hover-scale"
                  onClick={() => navigate('/auth')}
                >
                  Start Buying <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 hover-scale"
                  onClick={() => navigate('/auth')}
                >
                  I'm a Farmer
                </Button>
              </div>
            </div>
            <div className="relative animate-fade-in">
              <img 
                src={heroImage} 
                alt="Fresh vegetables and farmers market" 
                className="rounded-2xl shadow-2xl w-full h-[500px] object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-card p-6 rounded-xl shadow-lg border animate-slide-in-right">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-8 w-8 text-success" />
                  <div>
                    <p className="font-semibold">Fresh Delivery</p>
                    <p className="text-sm text-muted-foreground">Same day pickup</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose Our Platform?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We're revolutionizing agriculture by connecting farmers directly with consumers
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover-scale border-0 shadow-lg bg-card/80 backdrop-blur">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-secondary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground">
              Simple steps to get fresh produce or sell your harvest
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto bg-primary rounded-full flex items-center justify-center mb-6">
                <Phone className="h-10 w-10 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">1. Sign Up</h3>
              <p className="text-muted-foreground">
                Create your account as a farmer or buyer in just a few clicks
              </p>
            </div>
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto bg-secondary rounded-full flex items-center justify-center mb-6">
                <MapPin className="h-10 w-10 text-secondary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">2. Find & Connect</h3>
              <p className="text-muted-foreground">
                Browse fresh produce or list your harvest with location details
              </p>
            </div>
            <div className="text-center animate-fade-in">
              <div className="w-20 h-20 mx-auto bg-accent rounded-full flex items-center justify-center mb-6">
                <Clock className="h-10 w-10 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-4">3. Trade Direct</h3>
              <p className="text-muted-foreground">
                Place orders, communicate directly, and arrange pickup/delivery
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-primary-foreground mb-6">
            Ready to Transform Agriculture?
          </h2>
          <p className="text-xl text-primary-foreground/90 mb-8">
            Join thousands of farmers and buyers who are already benefiting from direct trade
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              className="text-lg px-8 py-6 hover-scale"
              onClick={() => navigate('/auth')}
            >
              Get Started Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary hover-scale"
              onClick={() => navigate('/browse')}
            >
              Browse Produce
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;