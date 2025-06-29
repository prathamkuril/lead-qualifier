import React from 'react';

export interface Lead {
  id: number;
  name: string;
  company: string;
  industry: string;
  size: number;
  source: string;
  created_at: string;
  quality?: string | null;
  summary?: string | null;
}

interface Props {
  leads: Lead[];
  sortKey: keyof Lead | '';
  sortDir: 'asc' | 'desc';
  onSort: (key: keyof Lead) => void;
}

const LeadTable: React.FC<Props> = ({ leads, sortKey, sortDir, onSort }) => {
  const headers: { key: keyof Lead; label: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'company', label: 'Company' },
    { key: 'industry', label: 'Industry' },
    { key: 'size', label: 'Size' },
    { key: 'source', label: 'Source' },
    { key: 'created_at', label: 'Created' },
    { key: 'quality', label: 'Quality' },
    { key: 'summary', label: 'Summary' },
  ];

  return (
    <table className="leads-table">
      <thead>
        <tr>
          {headers.map((h) => (
            <th
              key={h.key}
              onClick={() => onSort(h.key)}
              className={sortKey === h.key ? `sort-${sortDir}` : undefined}
            >
              {h.label}
            </th>
          ))}
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
            <td>{lead.quality ?? '-'}</td>
            <td>{lead.summary ?? '-'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default LeadTable;
