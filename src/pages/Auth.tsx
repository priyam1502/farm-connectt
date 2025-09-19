import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Sprout, ShoppingCart, Phone, Mail, ArrowLeft } from "lucide-react";

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('phone');
  const [otpStep, setOtpStep] = useState<'phone' | 'verify'>('phone');
  const [isSignUp, setIsSignUp] = useState(false);
  
  const { signIn, signUp, signInWithOtp, verifyOtp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [emailData, setEmailData] = useState({
    email: "",
    password: ""
  });

  const [phoneData, setPhoneData] = useState({
    phone: "",
    otp: ""
  });

  const [signUpData, setSignUpData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    location: "",
    user_type: "buyer" as "farmer" | "buyer"
  });

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // If it starts with country code, keep it
    if (digits.startsWith('91') && digits.length === 12) {
      return `+${digits}`;
    }
    
    // If it's 10 digits, add +91
    if (digits.length === 10) {
      return `+91${digits}`;
    }
    
    return `+91${digits.slice(-10)}`;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signIn(emailData.email, emailData.password);
    
    if (error) {
      toast({
        title: "Error signing in",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome back!",
        description: "You have been signed in successfully."
      });
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const { error } = await signUp(signUpData.email, signUpData.password, {
      user_type: signUpData.user_type,
      full_name: signUpData.full_name,
      phone: signUpData.phone,
      location: signUpData.location
    });
    
    if (error) {
      toast({
        title: "Error creating account",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Account created!",
        description: "Please check your email to confirm your account."
      });
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedPhone = formatPhoneNumber(phoneData.phone);
    const { error } = await signInWithOtp(formattedPhone);
    
    if (error) {
      toast({
        title: "Error sending OTP",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "OTP Sent!",
        description: "Please check your SMS for the verification code."
      });
      setOtpStep('verify');
    }
    
    setIsLoading(false);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formattedPhone = formatPhoneNumber(phoneData.phone);
    const userData = isSignUp ? {
      user_type: signUpData.user_type,
      full_name: signUpData.full_name || 'User',
      location: signUpData.location
    } : undefined;
    
    const { error } = await verifyOtp(formattedPhone, phoneData.otp, userData);
    
    if (error) {
      toast({
        title: "Error verifying OTP",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Welcome!",
        description: "You have been signed in successfully."
      });
      navigate("/dashboard");
    }
    
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetPhoneAuth = () => {
    setOtpStep('phone');
    setPhoneData({ phone: phoneData.phone, otp: "" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-medium">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-primary to-accent p-3 rounded-full">
              <Sprout className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">Farm Connect</CardTitle>
          <p className="text-muted-foreground">Direct from farm to your table</p>
        </CardHeader>
        
        <CardContent>
          {authMethod === 'phone' && otpStep === 'verify' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Button variant="ghost" size="sm" onClick={resetPhoneAuth}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold">Verify OTP</h3>
              </div>
              
              {isSignUp && (
                <div className="space-y-4 mb-4 p-4 bg-muted rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Full Name</Label>
                    <Input
                      id="signup-name"
                      value={signUpData.full_name}
                      onChange={(e) => setSignUpData({...signUpData, full_name: e.target.value})}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="user-type">I am a</Label>
                    <Select value={signUpData.user_type} onValueChange={(value: "farmer" | "buyer") => setSignUpData({...signUpData, user_type: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="buyer">
                          <div className="flex items-center gap-2">
                            <ShoppingCart className="h-4 w-4" />
                            Buyer
                          </div>
                        </SelectItem>
                        <SelectItem value="farmer">
                          <div className="flex items-center gap-2">
                            <Sprout className="h-4 w-4" />
                            Farmer
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-location">Location (Optional)</Label>
                    <Input
                      id="signup-location"
                      value={signUpData.location}
                      onChange={(e) => setSignUpData({...signUpData, location: e.target.value})}
                      placeholder="City, State"
                    />
                  </div>
                </div>
              )}
              
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP sent to {phoneData.phone}</Label>
                  <Input
                    id="otp"
                    value={phoneData.otp}
                    onChange={(e) => setPhoneData({...phoneData, otp: e.target.value})}
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Verifying..." : "Verify & Continue"}
                </Button>
              </form>
            </div>
          ) : (
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin" onClick={() => setIsSignUp(false)}>Sign In</TabsTrigger>
                <TabsTrigger value="signup" onClick={() => setIsSignUp(true)}>Sign Up</TabsTrigger>
              </TabsList>
              
              <div className="mt-4">
                <div className="flex gap-2 mb-4">
                  <Button
                    variant={authMethod === 'phone' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuthMethod('phone')}
                    className="flex-1"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Phone
                  </Button>
                  <Button
                    variant={authMethod === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setAuthMethod('email')}
                    className="flex-1"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
              
              <TabsContent value="signin">
                {authMethod === 'phone' ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-phone">Phone Number</Label>
                      <Input
                        id="signin-phone"
                        type="tel"
                        value={phoneData.phone}
                        onChange={(e) => setPhoneData({...phoneData, phone: e.target.value})}
                        placeholder="9876543210"
                        required
                      />
                      <p className="text-xs text-muted-foreground">We'll send you an OTP to verify</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleEmailSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        value={emailData.email}
                        onChange={(e) => setEmailData({...emailData, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="signin-password">Password</Label>
                      <Input
                        id="signin-password"
                        type="password"
                        value={emailData.password}
                        onChange={(e) => setEmailData({...emailData, password: e.target.value})}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </form>
                )}
              </TabsContent>
              
              <TabsContent value="signup">
                {authMethod === 'phone' ? (
                  <form onSubmit={handlePhoneSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="signup-phone">Phone Number</Label>
                      <Input
                        id="signup-phone"
                        type="tel"
                        value={phoneData.phone}
                        onChange={(e) => setPhoneData({...phoneData, phone: e.target.value})}
                        placeholder="9876543210"
                        required
                      />
                      <p className="text-xs text-muted-foreground">We'll send you an OTP to create your account</p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Sending OTP..." : "Send OTP"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleEmailSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="user-type">I am a</Label>
                      <Select value={signUpData.user_type} onValueChange={(value: "farmer" | "buyer") => setSignUpData({...signUpData, user_type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="buyer">
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="h-4 w-4" />
                              Buyer
                            </div>
                          </SelectItem>
                          <SelectItem value="farmer">
                            <div className="flex items-center gap-2">
                              <Sprout className="h-4 w-4" />
                              Farmer
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="full-name">Full Name</Label>
                      <Input
                        id="full-name"
                        value={signUpData.full_name}
                        onChange={(e) => setSignUpData({...signUpData, full_name: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={signUpData.phone}
                        onChange={(e) => setSignUpData({...signUpData, phone: e.target.value})}
                        placeholder="9876543210"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={signUpData.location}
                        onChange={(e) => setSignUpData({...signUpData, location: e.target.value})}
                        placeholder="City, State"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-email">Email</Label>
                      <Input
                        id="signup-email"
                        type="email"
                        value={signUpData.email}
                        onChange={(e) => setSignUpData({...signUpData, email: e.target.value})}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="signup-password">Password</Label>
                      <Input
                        id="signup-password"
                        type="password"
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({...signUpData, password: e.target.value})}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                    
                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleGoogleSignIn}
                      disabled={isLoading}
                    >
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Continue with Google
                    </Button>
                  </form>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
