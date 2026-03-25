import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useNavigate } from 'react-router-dom';
import { User, Lock, Trash2, Shield, LogOut } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { settingsApi } from '../api/settings';
import { useAuthStore } from '../stores/authStore';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, updateUser, logout } = useAuthStore();
  const navigate = useNavigate();

  // Profile
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [profileSaving, setProfileSaving] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Delete
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleting, setDeleting] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    try {
      const emailChanged = email !== user?.email;
      const res = await settingsApi.updateProfile({ name, email });
      updateUser(res.data.data);
      if (emailChanged) {
        toast.success('Profile updated. Check your new email for a verification link.', { duration: 6000 });
      } else {
        toast.success('Profile updated');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordSaving(true);
    try {
      await settingsApi.changePassword({ currentPassword, newPassword });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password changed. You will be logged out shortly.');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 1500);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }
    setDeleting(true);
    try {
      await settingsApi.deleteAccount(deletePassword);
      toast.success('Account deleted');
      logout();
      navigate('/');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete account');
    } finally {
      setDeleting(false);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await settingsApi.revokeAllSessions();
      toast.success('All sessions revoked. Please log in again.');
      logout();
      navigate('/login');
    } catch {
      toast.error('Failed to revoke sessions');
    }
  };

  return (
    <>
      <Helmet><title>Settings — Cardova</title></Helmet>
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-zinc-100 mb-8">Account Settings</h1>

        {/* Profile */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <User className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Profile</h2>
              <p className="text-sm text-zinc-500">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button type="submit" isLoading={profileSaving}>
              Save Changes
            </Button>
          </form>
        </section>

        {/* Password */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center">
              <Lock className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Change Password</h2>
              <p className="text-sm text-zinc-500">Update your password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
            <Input
              label="New Password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="At least 8 characters, 1 uppercase, 1 number"
              required
            />
            <Input
              label="Confirm New Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
            <Button type="submit" isLoading={passwordSaving}>
              Change Password
            </Button>
          </form>
        </section>

        {/* Sessions */}
        <section className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-zinc-100">Security</h2>
              <p className="text-sm text-zinc-500">Manage your active sessions</p>
            </div>
          </div>

          <Button variant="secondary" onClick={handleRevokeAll}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out All Devices
          </Button>
        </section>

        {/* Danger Zone */}
        <section className="bg-zinc-900/50 border border-red-900/50 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
              <Trash2 className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-red-400">Danger Zone</h2>
              <p className="text-sm text-zinc-500">Permanently delete your account and all data</p>
            </div>
          </div>

          <div className="space-y-4">
            <Input
              label="Enter your password"
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              placeholder="Your current password"
            />
            <Input
              label='Type "DELETE" to confirm'
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
            />
            <Button
              variant="secondary"
              onClick={handleDeleteAccount}
              isLoading={deleting}
              className="!border-red-800 !text-red-400 hover:!bg-red-950"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete My Account
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
