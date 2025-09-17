import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Sprout, Home, Package, ShoppingCart, Plus, LogOut, User } from "lucide-react";

const Navbar = () => {
  const { user, profile, signOut } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b bg-card shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-primary">
            <div className="bg-gradient-to-r from-primary to-accent p-2 rounded-full">
              <Sprout className="h-5 w-5 text-white" />
            </div>
            Farm Connect
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link to="/dashboard">
                  <Button variant={isActive('/dashboard') ? 'default' : 'ghost'} size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Link to="/browse">
                  <Button variant={isActive('/browse') ? 'default' : 'ghost'} size="sm">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Browse
                  </Button>
                </Link>

                <Link to="/orders">
                  <Button variant={isActive('/orders') ? 'default' : 'ghost'} size="sm">
                    <Package className="h-4 w-4 mr-2" />
                    Orders
                  </Button>
                </Link>

                {profile?.user_type === 'farmer' && (
                  <Link to="/add-produce">
                    <Button variant={isActive('/add-produce') ? 'default' : 'ghost'} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Produce
                    </Button>
                  </Link>
                )}

                <Button onClick={signOut} variant="outline" size="sm">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button>
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;