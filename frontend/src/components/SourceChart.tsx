import React, { useEffect, useRef } from 'react';

declare const Chart: any;

interface Props {
  counts: Record<string, number>;
}

const SourceChart: React.FC<Props> = ({ counts }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(counts),
        datasets: [
          {
            label: 'Leads',
            data: Object.values(counts),
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
      },
    });
  }, [counts]);

  return <canvas ref={canvasRef} />;
};

export default SourceChart;
