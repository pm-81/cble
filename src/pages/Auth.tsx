import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { z } from 'zod';
import { ThemeToggle } from '@/components/ThemeToggle';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');

export default function Auth() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, signIn, signUp, resetPassword, updatePassword, loading } = useAuth();

  const mode = searchParams.get('mode');
  const [activeTab, setActiveTab] = useState(mode === 'signup' ? 'signup' : mode === 'reset_callback' ? 'update_password' : 'signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  // Redirect if authenticated (unless in reset flow)
  useEffect(() => {
    if (user && !loading && activeTab !== 'update_password') {
      navigate('/dashboard');
    }
  }, [user, loading, navigate, activeTab]);

  useEffect(() => {
    if (mode === 'reset_callback') {
      setActiveTab('update_password');
    } else if (mode === 'signup') {
      setActiveTab('signup');
    }
  }, [mode]);

  const validateForm = (): boolean => {
    try {
      if (activeTab === 'signin' || activeTab === 'signup' || activeTab === 'forgot_password') {
        if (activeTab !== 'update_password') emailSchema.parse(email);
      }
      if (activeTab === 'signin' || activeTab === 'signup' || activeTab === 'update_password') {
        passwordSchema.parse(password);
      }
      return true;
    } catch (err) {
      if (err instanceof z.ZodError) {
        setError(err.errors[0].message);
      }
      return false;
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    const { error } = await signIn(email, password);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(error.message);
      }
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;

    setIsSubmitting(true);
    const { error } = await signUp(email, password, displayName);
    setIsSubmitting(false);

    if (error) {
      if (error.message.includes('already registered')) {
        setError('This email is already registered. Please sign in instead.');
      } else {
        setError(error.message);
      }
    } else {
      setSuccess('Account created successfully! You can now sign in.');
      setActiveTab('signin');
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      emailSchema.parse(email);
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const { error } = await resetPassword(email);
    setIsSubmitting(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Check your email for the password reset link.');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      passwordSchema.parse(password);
    } catch (err) {
      if (err instanceof z.ZodError) setError(err.errors[0].message);
      return;
    }

    setIsSubmitting(true);
    const { error } = await updatePassword(password);
    setIsSubmitting(false);

    if (error) {
      setError(error.message);
    } else {
      setSuccess('Password updated successfully! Redirecting...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Background */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />

      {/* Header */}
      <header className="container py-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary">
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">
            CBLE<span className="text-primary">Test</span>
          </span>
        </Link>
        <ThemeToggle />
      </header>

      {/* Auth Card */}
      <div className="flex flex-1 items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">
              {activeTab === 'signin' && 'Welcome Back'}
              {activeTab === 'signup' && 'Create Account'}
              {activeTab === 'forgot_password' && 'Reset Password'}
              {activeTab === 'update_password' && 'Set New Password'}
            </CardTitle>
            <CardDescription>
              {activeTab === 'signin' && 'Sign in to continue your exam preparation'}
              {activeTab === 'signup' && 'Start your journey to passing the CBLE'}
              {activeTab === 'forgot_password' && 'Enter your email to receive a reset link'}
              {activeTab === 'update_password' && 'Enter your new secure password'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {activeTab === 'update_password' ? (
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    minLength={6}
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-success bg-success/10">
                    <AlertDescription className="text-success">{success}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full gradient-primary" disabled={isSubmitting}>
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update Password'}
                </Button>
              </form>
            ) : (
              <Tabs value={activeTab === 'forgot_password' ? 'signin' : activeTab} onValueChange={(val) => {
                setError(null);
                setSuccess(null);
                setActiveTab(val);
              }}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Sign In</TabsTrigger>
                  <TabsTrigger value="signup">Sign Up</TabsTrigger>
                </TabsList>

                {error && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {success && (
                  <Alert className="mt-4 border-success bg-success/10">
                    <AlertDescription className="text-success">{success}</AlertDescription>
                  </Alert>
                )}

                {activeTab === 'forgot_password' ? (
                  <form onSubmit={handleResetRequest} className="space-y-4 mt-4 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="space-y-2">
                      <Label htmlFor="reset-email">Email Address</Label>
                      <Input
                        id="reset-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}
                    </Button>
                    <Button type="button" variant="ghost" className="w-full" onClick={() => setActiveTab('signin')}>
                      Back to Sign In
                    </Button>
                  </form>
                ) : (
                  <>
                    <TabsContent value="signin">
                      <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="signin-email">Email</Label>
                          <Input
                            id="signin-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                          />
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="signin-password">Password</Label>
                            <button
                              type="button"
                              onClick={() => setActiveTab('forgot_password')}
                              className="text-xs text-primary hover:underline"
                            >
                              Forgot password?
                            </button>
                          </div>
                          <Input
                            id="signin-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="current-password"
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full gradient-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Signing in...
                            </>
                          ) : (
                            'Sign In'
                          )}
                        </Button>
                      </form>
                    </TabsContent>

                    <TabsContent value="signup">
                      <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="signup-name">Display Name (optional)</Label>
                          <Input
                            id="signup-name"
                            type="text"
                            placeholder="Your name"
                            value={displayName}
                            onChange={(e) => setDisplayName(e.target.value)}
                            autoComplete="name"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-email">Email</Label>
                          <Input
                            id="signup-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            autoComplete="email"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="signup-password">Password</Label>
                          <Input
                            id="signup-password"
                            type="password"
                            placeholder="At least 6 characters"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                            minLength={6}
                          />
                        </div>
                        <Button
                          type="submit"
                          className="w-full gradient-primary"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating account...
                            </>
                          ) : (
                            'Create Account'
                          )}
                        </Button>
                      </form>
                    </TabsContent>
                  </>
                )}
              </Tabs>
            )}

            <p className="mt-6 text-center text-xs text-muted-foreground">
              By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
