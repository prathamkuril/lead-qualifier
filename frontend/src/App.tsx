import React, { useEffect, useState, useRef } from 'react';

// Chart.js is loaded globally via a script tag in index.html
declare const Chart: any;

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
  const [size, setSize] = useState<number>(0);
  const [view, setView] = useState<View>('table');
  const [sourceCounts, setSourceCounts] = useState<Record<string, number>>({});

  // Refs for rendering the Chart.js graph
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);

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
    if (size) params.append('size', size.toString());
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

  // Render the chart whenever the data or view changes
  useEffect(() => {
    if (view !== 'chart' || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(sourceCounts),
        datasets: [
          {
            label: 'Leads',
            data: Object.values(sourceCounts),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
        },
      },
    });
  }, [view, sourceCounts]);

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
          Min Size: {size}
          <input
            type="range"
            min="0"
            max="500"
            value={size}
            onChange={onSizeChange}
            style={{ width: '10rem', verticalAlign: 'middle', marginLeft: '0.5rem' }}
          />
        </label>
        <button onClick={onRefresh} style={{ marginLeft: '1rem' }}>Refresh</button>
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
        <canvas ref={canvasRef} />
      )}
    </div>
  );
};

export default App;
