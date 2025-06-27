import React, { useEffect, useState } from 'react';

interface Lead {
  id: number;
  name: string;
  company: string;
  industry: string;
  size: number;
  source: string;
  created_at: string;
}

type View = 'table' | 'chart';

const App: React.FC = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState<string>('');
  const [view, setView] = useState<View>('table');
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});

  const postEvent = async (action: string, metadata: Record<string, any>) => {
    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo',
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
    if (size) params.append('size', size);
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
    setSize(e.target.value);
    postEvent('size_filter', { size: e.target.value });
  };

  const onToggleView = (v: View) => {
    setView(v);
    postEvent('toggle_view', { view: v });
  };

  return (
    <div style={{ padding: '1rem' }}>
      <h1>Leads Dashboard</h1>
      <div style={{ marginBottom: '1rem' }}>
        <label>
          Industry:
          <select value={industry} onChange={onIndustryChange}>
            <option value="">All</option>
            <option value="Technology">Technology</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Finance">Finance</option>
          </select>
        </label>
        <label style={{ marginLeft: '1rem' }}>
          Min Size:
          <input type="number" value={size} onChange={onSizeChange} style={{ width: '6rem' }} />
        </label>
        <button onClick={() => onToggleView('table')} style={{ marginLeft: '1rem' }}>Table</button>
        <button onClick={() => onToggleView('chart')} style={{ marginLeft: '0.5rem' }}>Chart</button>
      </div>

      {view === 'table' ? (
        <table border={1} cellPadding={4} cellSpacing={0}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Company</th>
              <th>Industry</th>
              <th>Size</th>
              <th>Source</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>{lead.name}</td>
                <td>{lead.company}</td>
                <td>{lead.industry}</td>
                <td>{lead.size}</td>
                <td>{lead.source}</td>
                <td>{new Date(lead.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div>
          {Object.entries(sourceCounts).map(([src, count]) => (
            <div key={src} style={{ display: 'flex', alignItems: 'center', marginBottom: '4px' }}>
              <div style={{ width: '80px' }}>{src}</div>
              <div style={{ background: 'steelblue', height: '20px', width: `${count * 20}px`, marginRight: '4px' }} />
              <span>{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
