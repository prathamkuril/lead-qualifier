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

const LeadTable: React.FC<{ leads: Lead[] }> = ({ leads }) => (
  <table className="leads-table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Company</th>
        <th>Industry</th>
        <th>Size</th>
        <th>Source</th>
        <th>Created</th>
        <th>Quality</th>
        <th>Summary</th>
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

export default LeadTable;
