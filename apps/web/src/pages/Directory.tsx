import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { Search, MapPin, Briefcase, Users, ChevronLeft, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Spinner from '../components/ui/Spinner';
import { client } from '../api/client';

interface DirectoryCard {
  username: string;
  displayName: string;
  title: string;
  company: string;
  location: string;
  bio: string;
  avatarUrl: string | null;
  theme: string;
  cardType: string;
}

export default function Directory() {
  const [searchInput, setSearchInput] = useState('');
  const [professionInput, setProfessionInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [filters, setFilters] = useState({ q: '', profession: '', location: '' });
  const [page, setPage] = useState(1);
  const apiUrl = import.meta.env.VITE_API_URL || '';

  const { data, isLoading } = useQuery({
    queryKey: ['directory', filters, page],
    queryFn: () =>
      client
        .get<{ success: boolean; data: { cards: DirectoryCard[]; total: number; pages: number; page: number } }>('/directory/search', {
          params: { q: filters.q || undefined, profession: filters.profession || undefined, location: filters.location || undefined, page },
        })
        .then((r) => r.data.data),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ q: searchInput, profession: professionInput, location: locationInput });
    setPage(1);
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    return `${apiUrl}${url}`;
  };

  const popularSearches = [
    { label: 'Designers', profession: 'designer' },
    { label: 'Developers', profession: 'developer' },
    { label: 'Founders', profession: 'founder' },
    { label: 'Marketing', profession: 'marketing' },
    { label: 'Real Estate', profession: 'real estate' },
    { label: 'Photography', profession: 'photographer' },
  ];

  return (
    <>
      <Helmet>
        <title>Directory — Find Professionals on Cardova</title>
        <meta name="description" content="Browse and discover professionals, businesses, and freelancers on Cardova. Search by profession, location, or name." />
      </Helmet>
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-zinc-100 mb-2">Discover Professionals</h1>
          <p className="text-zinc-400">Browse digital cards by profession, location, or name</p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search by name, company, or keyword..."
                className="w-full pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={professionInput}
                onChange={(e) => setProfessionInput(e.target.value)}
                placeholder="Profession..."
                className="w-full sm:w-44 pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                value={locationInput}
                onChange={(e) => setLocationInput(e.target.value)}
                placeholder="Location..."
                className="w-full sm:w-44 pl-10 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-brand-500 hover:bg-brand-600 text-white font-semibold rounded-xl transition-colors"
            >
              Search
            </button>
          </div>
        </form>

        {/* Popular Searches */}
        {!filters.q && !filters.profession && !filters.location && (
          <div className="flex flex-wrap gap-2 mb-8 justify-center">
            {popularSearches.map((ps) => (
              <button
                key={ps.label}
                onClick={() => {
                  setProfessionInput(ps.profession);
                  setFilters({ q: '', profession: ps.profession, location: '' });
                  setPage(1);
                }}
                className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors"
              >
                {ps.label}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {isLoading ? (
          <div className="py-20 flex justify-center">
            <Spinner size="lg" />
          </div>
        ) : data && data.cards.length > 0 ? (
          <>
            <p className="text-sm text-zinc-500 mb-4">
              {data.total} {data.total === 1 ? 'result' : 'results'} found
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.cards.map((card) => (
                <Link
                  key={card.username}
                  to={`/${card.username}`}
                  className="group block bg-zinc-900/50 border border-zinc-800 rounded-2xl p-5 hover:border-zinc-700 hover:-translate-y-0.5 transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 rounded-full overflow-hidden bg-zinc-800 flex-shrink-0">
                      {getImageUrl(card.avatarUrl) ? (
                        <img
                          src={getImageUrl(card.avatarUrl)!}
                          alt={card.displayName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-500 text-white text-lg font-bold">
                          {card.displayName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-zinc-200 group-hover:text-zinc-100 truncate">
                          {card.displayName}
                        </h3>
                        {card.cardType === 'business' && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 flex-shrink-0">
                            BIZ
                          </span>
                        )}
                      </div>
                      {(card.title || card.company) && (
                        <p className="text-xs text-zinc-500 mt-0.5 truncate">
                          {card.title}
                          {card.title && card.company && ' at '}
                          {card.company}
                        </p>
                      )}
                      {card.location && (
                        <p className="text-xs text-zinc-600 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {card.location}
                        </p>
                      )}
                      {card.bio && (
                        <p className="text-xs text-zinc-500 mt-2 line-clamp-2 leading-relaxed">
                          {card.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {data.pages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-8">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page <= 1}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-zinc-500">
                  Page {data.page} of {data.pages}
                </span>
                <button
                  onClick={() => setPage(Math.min(data.pages, page + 1))}
                  disabled={page >= data.pages}
                  className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-300 mb-2">No cards found</h3>
            <p className="text-sm text-zinc-500">Try a different search or browse popular categories above.</p>
          </div>
        )}
      </div>
    </>
  );
}
