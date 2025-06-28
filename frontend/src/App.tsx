import React, { useEffect, useState } from 'react';
import FilterBar, { View } from './components/FilterBar';
import LeadTable, { Lead } from './components/LeadTable';
import SourceChart from './components/SourceChart';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState<number>(0);
  const [view, setView] = useState<View>('table');
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});

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
    const params = new URLSearchParams();
    if (industry) params.append('industry', industry);
    if (size) params.append('size', size.toString());
    params.append('enrich', 'true');
    const res = await fetch(`/api/leads?${params.toString()}`);
    const data: Lead[] = await res.json();
    setLeads(data);
    const counts: Record<string, number> = {};
    data.forEach((l) => {
      counts[l.source] = (counts[l.source] || 0) + 1;
    });
    setSourceCounts(counts);
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
    postEvent('industry_filter', { industry: e.target.value });
  };

  const onSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSize(value);
    postEvent('size_filter', { size: value });
  };

  const onToggleView = (v: View) => {
    setView(v);
    postEvent('toggle_view', { view: v });
  };

  const onRefresh = () => {
    fetchLeads();
    postEvent('refresh', {});
  };

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
        onToggleView={onToggleView}
      />

      {view === 'table' ? (
        <LeadTable leads={leads} />
      ) : (
        <SourceChart counts={sourceCounts} />
      )}
    </div>
  );
};

export default App;
