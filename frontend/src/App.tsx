import React, { useEffect, useRef, useState } from 'react';
import FilterBar, { View } from './components/FilterBar';
import LeadTable, { Lead } from './components/LeadTable';
import SourceChart from './components/SourceChart';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [sortKey, setSortKey] = useState<keyof Lead | ''>('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState<number>(0);
  const [view, setView] = useState<View>('table');
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const requestId = useRef(0);

  // Persist a unique identifier so events can be tied to a user session
  const [userId] = useState(() => {
    let id = localStorage.getItem('userId');
    if (!id) {
      id = crypto.randomUUID();
      localStorage.setItem('userId', id);
    }
    return id;
  });

  const postEvent = async (action: string, metadata: Record<string, any>) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          action,
          metadata,
          timestamp: new Date().toISOString(),
        }),
      });
    } catch (err) {
      console.error('Failed to post event', err);
    }
  };

  const fetchLeads = async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (industry) params.append('industry', industry);
      if (size) params.append('size', size.toString());
      params.append('enrich', 'true');
      const res = await fetch(`/api/leads?${params.toString()}`);
      const data: Lead[] = await res.json();
      if (id !== requestId.current) return;
      setLeads(data);
      const counts: Record<string, number> = {};
      data.forEach((l) => {
        counts[l.source] = (counts[l.source] || 0) + 1;
      });
      setSourceCounts(counts);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
    postEvent('page_load', {});
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [industry, size]);

  const onIndustryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setIndustry(e.target.value);
    postEvent('filter', { filterType: 'industry', value: e.target.value });
  };

  const onSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSize(value);
    postEvent('filter', { filterType: 'size', value });
  };

  const onToggleView = (v: View) => {
    setView(v);
    postEvent('toggle_view', { view: v });
  };

  const onRefresh = () => {
    fetchLeads();
    postEvent('refresh', {});
  };

  const onReset = () => {
    setIndustry('');
    setSize(0);
    postEvent('reset_filters', {});
  };

  const onSort = (key: keyof Lead) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
      postEvent('sort', { key, direction: sortDir === 'asc' ? 'desc' : 'asc' });
    } else {
      setSortKey(key);
      setSortDir('asc');
      postEvent('sort', { key, direction: 'asc' });
    }
  };

  const sortedLeads = React.useMemo(() => {
    if (!sortKey) return leads;
    const data = [...leads];
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      if (typeof av === 'number' && typeof bv === 'number') {
        return sortDir === 'asc' ? av - bv : bv - av;
      }
      const as = String(av).toLowerCase();
      const bs = String(bv).toLowerCase();
      if (as < bs) return sortDir === 'asc' ? -1 : 1;
      if (as > bs) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return data;
  }, [leads, sortKey, sortDir]);

  return (
    <div className="container">
      <h1>Leads Dashboard</h1>
      <FilterBar
        industry={industry}
        size={size}
        view={view}
        onIndustryChange={onIndustryChange}
        onSizeChange={onSizeChange}
        onRefresh={onRefresh}
        onReset={onReset}
        onToggleView={onToggleView}
        loading={loading}
      />

      <p className="lead-count">Number of Leads: {sortedLeads.length}</p>

      {view === 'table' ? (
        <LeadTable
          leads={sortedLeads}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={onSort}
        />
      ) : (
        <SourceChart counts={sourceCounts} />
      )}
    </div>
  );
};

export default App;
