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
import { Switch } from '@/components/ui/switch';
import { Loader2, Save, User, Calendar, Clock, Bell } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Profile {
  display_name: string | null;
  exam_date: string | null;
  weekly_study_minutes: number;
  preferred_session_length: number;
}

export default function Settings() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Settings saved',
        description: 'Your preferences have been updated.',
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

  return (
    <Layout showFooter={false}>
      <div className="container max-w-2xl py-8">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold">Settings</h1>
          <p className="mt-1 text-muted-foreground">
            Manage your account and study preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile
              </CardTitle>
              <CardDescription>Your account information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  type="text"
                  placeholder="Your name"
                  value={profile?.display_name || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, display_name: e.target.value } : null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Exam Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Exam Details
              </CardTitle>
              <CardDescription>Configure your exam date</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="exam-date">Exam Date</Label>
                <Input
                  id="exam-date"
                  type="date"
                  value={profile?.exam_date || ''}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, exam_date: e.target.value } : null)}
                />
                <p className="text-xs text-muted-foreground">
                  Set your exam date to receive a personalized study plan
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Study Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Study Preferences
              </CardTitle>
              <CardDescription>Customize your study sessions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="weekly-minutes">Weekly Study Time (minutes)</Label>
                <Input
                  id="weekly-minutes"
                  type="number"
                  min={30}
                  max={1200}
                  value={profile?.weekly_study_minutes || 120}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, weekly_study_minutes: parseInt(e.target.value) || 120 } : null)}
                />
                <p className="text-xs text-muted-foreground">
                  {Math.round((profile?.weekly_study_minutes || 120) / 7)} minutes per day on average
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="session-length">Preferred Session Length (minutes)</Label>
                <Input
                  id="session-length"
                  type="number"
                  min={5}
                  max={90}
                  value={profile?.preferred_session_length || 20}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, preferred_session_length: parseInt(e.target.value) || 20 } : null)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            onClick={handleSave} 
            disabled={saving}
            className="w-full gradient-primary"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Settings
              </>
            )}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
