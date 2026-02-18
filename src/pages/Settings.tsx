import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Loader2, Save, User, Calendar, Clock, Bell, LogOut, Mail, Target } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  display_name: string | null;
  exam_date: string | null;
  weekly_study_minutes: number;
  preferred_session_length: number;
}

export default function Settings() {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'exam' | 'cadence'>('profile');

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, exam_date, weekly_study_minutes, preferred_session_length')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
      }
      setLoading(false);
    }

    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;

    setSaving(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        display_name: profile.display_name,
        exam_date: profile.exam_date,
        weekly_study_minutes: profile.weekly_study_minutes,
        preferred_session_length: profile.preferred_session_length,
      })
      .eq('user_id', user.id);

    setSaving(false);

    if (error) {
      toast({
        title: 'Update Failed',
        description: 'Failed to synchronize settings with the cloud.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Settings Synchronized',
        description: 'Your candidate profile has been updated.',
      });
    }
  };

  if (authLoading || loading) {
    return (
      <Layout showFooter={false}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'Identity', icon: User },
    { id: 'exam', label: 'Exam Prep', icon: Target },
    { id: 'cadence', label: 'Study Cadence', icon: Clock },
  ];

  return (
    <Layout showFooter={false}>
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 py-10 px-4">
        <div className="container max-w-5xl mx-auto space-y-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="space-y-1">
              <h1 className="font-display text-4xl font-black tracking-tight">Account <span className="text-primary italic">Control</span></h1>
              <p className="text-muted-foreground text-lg">Manage your candidate profile and training parameters.</p>
            </div>
            <Button
              variant="outline"
              size="lg"
              onClick={() => signOut()}
              className="rounded-2xl border-2 px-8 font-black uppercase tracking-widest text-xs h-14 hover:bg-destructive hover:text-white hover:border-destructive transition-all group"
            >
              <LogOut className="h-4 w-4 mr-2 group-hover:translate-x-1 transition-transform" />
              Sign Out
            </Button>
          </div>

          <div className="grid gap-8 lg:grid-cols-[240px,1fr] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {/* Sidebar Navigation */}
            <div className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 font-bold text-sm uppercase tracking-widest ${activeTab === tab.id
                    ? 'bg-primary text-white shadow-glow-primary translate-x-1'
                    : 'bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground border border-transparent'
                    }`}
                >
                  <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? 'animate-pulse' : ''}`} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Main Content Area */}
            <div className="space-y-8">
              <Card className="border-none shadow-3xl bg-card/60 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
                <CardHeader className="p-8 pb-4 border-b border-border/10">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                      {tabs.find(t => t.id === activeTab)?.icon && <div className="text-primary">
                        {(() => {
                          const Icon = tabs.find(t => t.id === activeTab)!.icon;
                          return <Icon className="h-6 w-6" />;
                        })()}
                      </div>}
                    </div>
                    <div>
                      <CardTitle className="text-xl font-black">{tabs.find(t => t.id === activeTab)?.label}</CardTitle>
                      <CardDescription>Update your {activeTab} information below.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  {activeTab === 'profile' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Candidate Email</Label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input
                            value={user.email || ''}
                            disabled
                            className="pl-11 h-14 rounded-2xl bg-muted/50 border-border/50 font-bold opacity-60"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Display Name</Label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <User className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input
                            placeholder="Enter your name"
                            value={profile?.display_name || ''}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                            className="pl-11 h-14 rounded-2xl bg-card border-border/50 focus:ring-primary focus:border-primary font-bold shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'exam' && (
                    <div className="space-y-6 animate-in fade-in duration-500">
                      <div className="space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Target Exam Date</Label>
                        <div className="relative group">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Calendar className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                          </div>
                          <Input
                            type="date"
                            value={profile?.exam_date || ''}
                            onChange={(e) => setProfile(prev => prev ? { ...prev, exam_date: e.target.value } : null)}
                            className="pl-11 h-14 rounded-2xl bg-card border-border/50 focus:ring-primary focus:border-primary font-bold shadow-sm"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground italic px-1">Setting this enables automated progress tracking against your deadline.</p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'cadence' && (
                    <div className="space-y-8 animate-in fade-in duration-500">
                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Weekly Velocity</Label>
                          <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-black">{profile?.weekly_study_minutes} MIN</Badge>
                        </div>
                        <Slider
                          min={30}
                          max={1200}
                          step={30}
                          value={[profile?.weekly_study_minutes || 120]}
                          onValueChange={([val]) => setProfile(prev => prev ? { ...prev, weekly_study_minutes: val } : null)}
                          className="py-4"
                        />
                        <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                          <span>30m Light</span>
                          <span>{Math.round((profile?.weekly_study_minutes || 120) / 7)}m Daily Average</span>
                          <span>1200m Intense</span>
                        </div>
                      </div>

                      <Separator className="bg-border/50" />

                      <div className="space-y-6">
                        <div className="flex items-center justify-between mb-2">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Standard Session Length</Label>
                          <Badge variant="secondary" className="bg-accent/10 text-accent border-none font-black">{profile?.preferred_session_length} MIN</Badge>
                        </div>
                        <Slider
                          min={5}
                          max={90}
                          step={5}
                          value={[profile?.preferred_session_length || 20]}
                          onValueChange={([val]) => setProfile(prev => prev ? { ...prev, preferred_session_length: val } : null)}
                          className="py-4"
                        />
                        <div className="flex justify-between text-[10px] font-black text-muted-foreground uppercase tracking-widest px-1">
                          <span>5m Drill</span>
                          <span>Standard Unit</span>
                          <span>90m Deep Dive</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Save Interaction */}
              <div className="flex items-center justify-end gap-6 pt-4">
                <p className="text-xs text-muted-foreground italic hidden sm:block">Changes will be synchronized across all synchronized devices.</p>
                <Button
                  onClick={handleSave}
                  disabled={saving}
                  className="rounded-2xl gradient-primary shadow-glow-primary h-14 px-12 font-black uppercase tracking-widest text-xs min-w-[200px] transition-all active:scale-95 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Syncing...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Secure Settings
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

