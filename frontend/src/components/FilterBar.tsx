import React from 'react';

export type View = 'table' | 'chart';

interface Props {
  industry: string;
  size: number;
  search: string;
  view: View;
  onIndustryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  onReset: () => void;
  onToggleView: (v: View) => void;
  onExportCSV: () => void;
  loading: boolean;
}

const FilterBar: React.FC<Props> = ({
  industry,
  size,
  search,
  view,
  onIndustryChange,
  onSizeChange,
  onSearchChange,
  onRefresh,
  onReset,
  onToggleView,
  onExportCSV,
  loading,
}) => (
  <div className="controls">
    <div className="view-toggle">
      <button
        onClick={() => onToggleView('table')}
        className={view === 'table' ? 'active' : ''}
      >
        Table
      </button>
      <button
        onClick={() => onToggleView('chart')}
        className={view === 'chart' ? 'active' : ''}
      >
        Chart
      </button>
    </div>
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
    <label>
      Min Size: {size}
      <input
        type="range"
        min="0"
        max="500"
        value={size}
        onChange={onSizeChange}
      />
    </label>
    <label>
      Search:
      <input
        type="text"
        value={search}
        onChange={onSearchChange}
        placeholder="Name or Company"
      />
    </label>
    <button onClick={onRefresh}>Refresh</button>
    <button onClick={onReset} disabled={loading} className="reset-button">
      Reset
      {loading && <span className="spinner" />}
    </button>
    <button onClick={onExportCSV} className="export-button">Export CSV</button>
  </div>
);

export default FilterBar;
