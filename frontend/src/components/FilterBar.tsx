import React from 'react';

export type View = 'table' | 'chart';

interface Props {
  industry: string;
  size: number;
  view: View;
  onIndustryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onSizeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRefresh: () => void;
  onToggleView: (v: View) => void;
}

const FilterBar: React.FC<Props> = ({
  industry,
  size,
  view,
  onIndustryChange,
  onSizeChange,
  onRefresh,
  onToggleView,
}) => (
  <div className="controls">
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
    <button onClick={onRefresh}>Refresh</button>
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
  </div>
);

export default FilterBar;
