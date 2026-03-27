import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, BarChart3, DollarSign, Eye, Crown, Trash2, Shield, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { adminApi, AdminUser } from '../api/admin';
import toast from 'react-hot-toast';

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string | number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-zinc-500">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
    </div>
  );
}

export default function Admin() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then((r) => r.data.data),
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminApi.listUsers(page, search || undefined).then((r) => r.data.data),
  });

  const toggleProMutation = useMutation({
    mutationFn: ({ userId, isPro }: { userId: string; isPro: boolean }) =>
      adminApi.updateUser(userId, { isPro }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User updated');
    },
    onError: () => toast.error('Failed to update user'),
  });

  const toggleRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: string }) =>
      adminApi.updateUser(userId, { role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast.success('Role updated');
    },
    onError: () => toast.error('Failed to update role'),
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
      toast.success('User deleted');
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to delete user'),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <>
      <Helmet><title>Admin — Cardova</title></Helmet>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Admin Panel</h1>
            <p className="text-sm text-zinc-500">Manage users and view platform stats</p>
          </div>
        </div>

        {/* Stats */}
        {statsLoading ? (
          <Spinner size="lg" className="py-12" />
        ) : stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
            <StatCard label="Total Users" value={stats.totalUsers} icon={Users} color="bg-blue-500/20 text-blue-400" />
            <StatCard label="Pro Users" value={stats.proUsers} icon={Crown} color="bg-brand-500/20 text-brand-400" />
            <StatCard label="Total Cards" value={stats.totalCards} icon={BarChart3} color="bg-green-500/20 text-green-400" />
            <StatCard label="Total Views" value={stats.totalViews.toLocaleString()} icon={Eye} color="bg-purple-500/20 text-purple-400" />
            <StatCard label="Revenue" value={`$${stats.totalRevenue.toFixed(0)}`} icon={DollarSign} color="bg-yellow-500/20 text-yellow-400" />
            <StatCard label="New (30d)" value={stats.newUsersLast30} icon={Users} color="bg-cyan-500/20 text-cyan-400" />
          </div>
        )}

        {/* Users Table */}
        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-zinc-100">Users</h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 w-64"
                />
              </div>
              <Button type="submit" size="sm">Search</Button>
            </form>
          </div>

          {usersLoading ? (
            <div className="py-12"><Spinner size="lg" /></div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">User</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Card</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                      <th className="text-left px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Joined</th>
                      <th className="text-right px-6 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {usersData?.users.map((u: AdminUser) => (
                      <tr key={u.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-zinc-200">{u.name}</p>
                          <p className="text-xs text-zinc-500">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          {u.card ? (
                            <div>
                              <span className="text-sm text-zinc-300">@{u.card.username}</span>
                              <span className="ml-2 text-xs text-zinc-600">{u.card.cardType}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-zinc-600">No card</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {u.isPro && (
                              <span className="px-2 py-0.5 bg-brand-500/20 text-brand-400 text-xs font-medium rounded-full">Pro</span>
                            )}
                            {u.role === 'admin' && (
                              <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">Admin</span>
                            )}
                            {!u.emailVerified && (
                              <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded-full">Unverified</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-zinc-500">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleProMutation.mutate({ userId: u.id, isPro: !u.isPro })}
                              disabled={toggleProMutation.isPending}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                u.isPro
                                  ? 'bg-brand-500/20 text-brand-400 hover:bg-brand-500/30'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                              }`}
                              title={u.isPro ? 'Remove Pro' : 'Make Pro'}
                            >
                              <Crown className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => toggleRoleMutation.mutate({
                                userId: u.id,
                                role: u.role === 'admin' ? 'user' : 'admin',
                              })}
                              disabled={toggleRoleMutation.isPending}
                              className={`px-2 py-1 rounded text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                                u.role === 'admin'
                                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                                  : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                              }`}
                              title={u.role === 'admin' ? 'Remove Admin' : 'Make Admin'}
                            >
                              <Shield className="w-3.5 h-3.5" />
                            </button>
                            {u.role !== 'admin' && (
                              <button
                                onClick={() => {
                                  if (confirm(`Delete user ${u.name}? This cannot be undone.`)) {
                                    deleteMutation.mutate(u.id);
                                  }
                                }}
                                disabled={deleteMutation.isPending}
                                className="px-2 py-1 rounded text-xs font-medium bg-zinc-800 text-zinc-400 hover:bg-red-950 hover:text-red-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                title="Delete User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {usersData && usersData.pages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-800">
                  <p className="text-sm text-zinc-500">
                    Page {usersData.page} of {usersData.pages} ({usersData.total} users)
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page <= 1}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setPage(Math.min(usersData.pages, page + 1))}
                      disabled={page >= usersData.pages}
                      className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
