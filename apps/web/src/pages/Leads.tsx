import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Mail, Phone, MessageSquare, Trash2, CheckCheck, Eye, Users, Calendar } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { leadsApi, Lead } from '../api/leads';
import toast from 'react-hot-toast';

export default function Leads() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data: statsData } = useQuery({
    queryKey: ['lead-stats'],
    queryFn: () => leadsApi.getStats().then((r) => r.data.data),
  });

  const { data: leadsData, isLoading } = useQuery({
    queryKey: ['leads', page],
    queryFn: () => leadsApi.getLeads(page).then((r) => r.data.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (leadId: string) => leadsApi.markRead(leadId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leads'] }); queryClient.invalidateQueries({ queryKey: ['lead-stats'] }); },
  });

  const markAllMutation = useMutation({
    mutationFn: () => leadsApi.markAllRead(),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leads'] }); queryClient.invalidateQueries({ queryKey: ['lead-stats'] }); toast.success('All marked as read'); },
  });

  const deleteMutation = useMutation({
    mutationFn: (leadId: string) => leadsApi.deleteLead(leadId),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['leads'] }); queryClient.invalidateQueries({ queryKey: ['lead-stats'] }); toast.success('Lead deleted'); },
  });

  return (
    <>
      <Helmet><title>Leads — Cardova</title></Helmet>
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Leads</h1>
            <p className="text-sm text-zinc-500 mt-1">Messages from your card visitors</p>
          </div>
          {statsData && statsData.unread > 0 && (
            <Button variant="secondary" size="sm" onClick={() => markAllMutation.mutate()} isLoading={markAllMutation.isPending}>
              <CheckCheck className="w-4 h-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Stats */}
        {statsData && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-brand-400" />
                <span className="text-xs text-zinc-500">Total Leads</span>
              </div>
              <p className="text-xl font-bold text-zinc-100">{statsData.total}</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Eye className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-zinc-500">Unread</span>
              </div>
              <p className="text-xl font-bold text-zinc-100">{statsData.unread}</p>
            </div>
            <div className="p-4 bg-zinc-900/50 border border-zinc-800 rounded-xl">
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-4 h-4 text-green-400" />
                <span className="text-xs text-zinc-500">Last 30 Days</span>
              </div>
              <p className="text-xl font-bold text-zinc-100">{statsData.last30}</p>
            </div>
          </div>
        )}

        {/* Leads List */}
        {isLoading ? (
          <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
        ) : leadsData && leadsData.leads.length > 0 ? (
          <div className="space-y-3">
            {leadsData.leads.map((lead: Lead) => (
              <div key={lead.id} className={`bg-zinc-900/50 border rounded-xl p-4 transition-colors ${lead.isRead ? 'border-zinc-800' : 'border-brand-500/30 bg-brand-500/5'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-zinc-200">{lead.name}</p>
                      {!lead.isRead && <span className="w-2 h-2 rounded-full bg-brand-400 flex-shrink-0" />}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{lead.email}</span>
                      {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{lead.phone}</span>}
                    </div>
                    {lead.message && (
                      <p className="text-sm text-zinc-400 flex items-start gap-2">
                        <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-zinc-600" />
                        {lead.message}
                      </p>
                    )}
                    <p className="text-[11px] text-zinc-600 mt-2">{new Date(lead.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!lead.isRead && (
                      <button onClick={() => markReadMutation.mutate(lead.id)} className="p-1.5 rounded-lg text-zinc-500 hover:text-green-400 hover:bg-green-500/10 transition-colors" title="Mark as read">
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                    <button onClick={() => { if (confirm('Delete this lead?')) deleteMutation.mutate(lead.id); }} className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {leadsData.pages > 1 && (
              <div className="flex justify-center gap-2 pt-4">
                {Array.from({ length: leadsData.pages }, (_, i) => (
                  <button key={i + 1} onClick={() => setPage(i + 1)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${page === i + 1 ? 'bg-brand-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}>
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-12 text-center">
            <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">No leads yet</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">Enable the lead capture form on your card to start receiving messages from visitors.</p>
          </div>
        )}
      </div>
    </>
  );
}
