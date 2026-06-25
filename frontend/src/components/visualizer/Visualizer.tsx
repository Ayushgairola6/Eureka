// import { useMemo } from 'react';
// import {
//     BarChart, Bar, LineChart, Line, PieChart, Pie,
//     RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
//     XAxis, YAxis, CartesianGrid,
//     Tooltip, Legend, ResponsiveContainer, Cell
// } from 'recharts';

// const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

// export default function Visualizer({ chartData }: any) {
//     const labels = chartData?.labels || chartData?.data?.labels;
//     const datasets = chartData?.data?.datasets || chartData?.datasets
//     // 1. Memoize transformation to optimize performance
//     const data = useMemo(() => {

//         if (!labels || !datasets) return [];

//         return labels.map((label: any, i: string | number) => {
//             const point: Record<string, any> = { name: label };
//             datasets.forEach((ds: { label: string | number; data: { [x: string]: number; }; }) => {
//                 // Safety check: ensure data exists at index i
//                 point[ds.label] = ds.data[i] ?? 0;
//             });
//             return point;
//         });
//     }, [chartData]);

//     if (!chartData || chartData?.chart_type === 'none' || chartData?.data?.chart_type === 'none') {
//         return (
//             <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl">
//                 <p className="text-gray-500">No quantifiable data available for this section.</p>
//             </div>
//         );
//     }

//     const commonProps = {
//         width: "100%",
//         height: 400
//     };

//     const renderChart = () => {
//         // Shared components to keep JSX clean
//         const commonElements = [
//             <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />,
//             <XAxis key="x" dataKey="name" fontSize={12} tickLine={false} axisLine={false} />,
//             <YAxis key="y" fontSize={12} tickLine={false} axisLine={false} />,
//             <Tooltip
//                 key="tooltip"
//                 contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
//             />,
//             <Legend key="legend" verticalAlign="top" height={36} />
//         ];

//         switch (chartData.chart_type || chartData?.data?.chart_type) {
//             case 'bar':
//                 return (
//                     <ResponsiveContainer {...commonProps}>
//                         <BarChart data={data}>
//                             {commonElements}
//                             {datasets.map((ds: any, i: number) => (
//                                 <Bar key={ds.label} dataKey={ds.label} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
//                             ))}
//                         </BarChart>
//                     </ResponsiveContainer>
//                 );

//             case 'line':
//                 return (
//                     <ResponsiveContainer {...commonProps}>
//                         <LineChart data={data}>
//                             {commonElements}
//                             {datasets.map((ds: any, i: number) => (
//                                 <Line
//                                     key={ds.label}
//                                     type="monotone"
//                                     dataKey={ds.label}
//                                     stroke={COLORS[i % COLORS.length]}
//                                     strokeWidth={3}
//                                     dot={{ r: 4 }}
//                                     activeDot={{ r: 6 }}
//                                 />
//                             ))}
//                         </LineChart>
//                     </ResponsiveContainer>
//                 );

//             case 'pie':
//             case 'doughnut':
//                 const pieData = labels.map((label: any, i: string | number) => ({
//                     name: label,
//                     value: datasets[0]?.data[i] || 0
//                 }));
//                 return (
//                     <ResponsiveContainer {...commonProps}>
//                         <PieChart>
//                             <Pie
//                                 data={pieData}
//                                 cx="50%"
//                                 cy="50%"
//                                 innerRadius={chartData.chart_type === 'doughnut' || chartData?.data.chart_type ? 70 : 0}
//                                 outerRadius={100}
//                                 dataKey="value"
//                                 paddingAngle={5}
//                                 label
//                             >
//                                 {pieData.map((_: any, i: number) => (
//                                     <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} stroke="none" />
//                                 ))}
//                             </Pie>
//                             <Tooltip />
//                             <Legend />
//                         </PieChart>
//                     </ResponsiveContainer>
//                 );

//             case 'radar':
//                 return (
//                     <ResponsiveContainer {...commonProps}>
//                         <RadarChart data={data}>
//                             <PolarGrid stroke="#374151" opacity={0.2} />
//                             <PolarAngleAxis dataKey="name" />
//                             <PolarRadiusAxis />
//                             <Tooltip />
//                             {datasets.map((ds: any, i: number) => {
//                                 const label = ds.label != null ? String(ds.label) : `dataset-${i}`;

//                                 return (
//                                     <Radar
//                                         key={label}
//                                         name={label}
//                                         dataKey={label}
//                                         stroke={COLORS[i % COLORS.length]}
//                                         fill={COLORS[i % COLORS.length]}
//                                         fillOpacity={0.4}
//                                     />
//                                 );
//                             })}
//                         </RadarChart>
//                     </ResponsiveContainer>
//                 );

//             default:
//                 return <div className="p-8 text-center text-orange-500">Unsupported chart type: {chartData.chart_type || chartData?.data.chart_type}</div>;
//         }
//     };

//     return (
//         <div className="w-full bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 p-6 transition-all">
//             <div className="mb-6">
//                 <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{chartData.title || chartData?.data.title}</h3>
//                 {chartData.reasoning || chartData?.data?.reasoning && (
//                     <p className="text-xs text-green-500  mt-2 space-grotesk">{chartData.reasoning || chartData?.data?.reasoning}</p>
//                 )}
//             </div>
//             <div className="h-[400px] w-full">
//                 {renderChart()}
//             </div>
//         </div>
//     );
// }

import { useMemo, useState, useCallback } from 'react';
import {
    BarChart, Bar, Line, PieChart, Pie,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
    Area, AreaChart, LabelList
} from 'recharts';

/* ─── Design Tokens ─── */
const THEME = {
    colors: {
        primary: '#0ea5e9',   // Sky 500
        secondary: '#8b5cf6', // Violet 500
        tertiary: '#10b981',  // Emerald 500
        quaternary: '#f59e0b', // Amber 500
        muted: '#94a3b8',     // Slate 400
        grid: '#e2e8f0',      // Slate 200
        gridDark: '#334155',  // Slate 700
        text: '#475569',      // Slate 600
        textDark: '#94a3b8',  // Slate 400
        bg: '#f8fafc',        // Slate 50
        bgDark: '#0f172a',    // Slate 900
    },
    font: {
        family: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        size: {
            xs: 10,
            sm: 11,
            base: 12,
            lg: 14,
            xl: 18,
        }
    }
};

const PALETTE = [
    '#0ea5e9', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#06b6d4', '#f97316'
];

/* ─── Types ─── */
interface Dataset {
    label: string;
    data: number[];
}

interface ChartPayload {
    chart_type: 'bar' | 'line' | 'area' | 'pie' | 'doughnut' | 'radar' | 'none';
    title?: string;
    reasoning?: string;
    labels: string[];
    datasets: Dataset[];
}

interface VisualizerProps {
    chartData?: {
        data?: ChartPayload;
        chart_type?: string;
        title?: string;
        reasoning?: string;
        labels?: string[];
        datasets?: Dataset[];
    } | null;
    isLoading?: boolean;
}

/* ─── Minimal Icon Components (replace with lucide if preferred) ─── */
const IconBar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 20V10M12 20V4M6 20v-6" /></svg>;
const IconLine = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
const IconArea = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>;
const IconPie = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21.21 15.89A10 10 0 1 1 8 2.83" /><path d="M22 12A10 10 0 0 0 12 2v10z" /></svg>;
const IconRadar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2l7 4.5v9L12 22l-7-4.5v-9L12 2z" /><circle cx="12" cy="12" r="3" /></svg>;
const IconTable = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 21V9" /></svg>;
const IconChart = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M3 3v18h18" /></svg>;
const IconDownload = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="M7 10l5 5 5-5" /><path d="M12 15V3" /></svg>;
const IconInfo = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>;
const IconChevron = ({ down }: { down?: boolean }) => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: down ? 'rotate(180deg)' : undefined, transition: 'transform 0.2s' }}><path d="M6 9l6 6 6-6" /></svg>;

const CHART_MODES = [
    { key: 'bar', icon: IconBar, label: 'Bar' },
    { key: 'line', icon: IconLine, label: 'Line' },
    { key: 'area', icon: IconArea, label: 'Area' },
    { key: 'pie', icon: IconPie, label: 'Pie' },
    { key: 'doughnut', icon: IconPie, label: 'Donut' },
    { key: 'radar', icon: IconRadar, label: 'Radar' },
] as const;

/* ─── Utilities ─── */
const fmt = (n: number) =>
    n >= 1e9 ? `${(n / 1e9).toFixed(1)}B` :
        n >= 1e6 ? `${(n / 1e6).toFixed(1)}M` :
            n >= 1e3 ? `${(n / 1e3).toFixed(1)}K` :
                n.toLocaleString(undefined, { maximumFractionDigits: 2 });

const downloadCSV = (filename: string, rows: Record<string, any>[]) => {
    if (!rows.length) return;
    const headers = Object.keys(rows[0]);
    const csv = [headers.join(','), ...rows.map(r =>
        headers.map(h => `"${String(r[h] ?? '').replace(/"/g, '""')}"`).join(',')
    )].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
};

/* ─── Components ─── */

const TooltipContent = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/95 dark:bg-neutral-900/95 backdrop-blur-sm border border-gray-100 dark:border-neutral-800 rounded-lg shadow-lg px-3 py-2.5 min-w-[160px]">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-neutral-500 uppercase tracking-wider mb-1.5">
                {label}
            </p>
            <div className="space-y-1">
                {payload.map((entry: any, idx: number) => (
                    <div key={idx} className="flex items-center justify-between gap-4 text-xs">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: entry.color }} />
                            <span className="text-gray-600 dark:text-neutral-300 font-medium">{entry.name}</span>
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white tabular-nums">
                            {typeof entry.value === 'number' ? fmt(entry.value) : entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const StatPill = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div className="flex flex-col px-3 py-2 rounded-md bg-gray-50/80 dark:bg-neutral-800/50 border border-gray-100/80 dark:border-neutral-800/50">
        <span className="text-[10px] font-medium text-gray-400 dark:text-neutral-500 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums" style={color ? { color } : undefined}>{value}</span>
    </div>
);

const EmptyState = () => (
    <div className="h-[320px] flex flex-col items-center justify-center text-center px-6">
        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-3">
            <IconChart />
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white">No quantifiable data</p>
        <p className="text-xs text-gray-400 dark:text-neutral-500 mt-1 max-w-[200px]">The agent hasn't generated chart data for this section yet.</p>
    </div>
);

/* ─── Main Visualizer ─── */
export default function Visualizer({ chartData, isLoading }: VisualizerProps) {
    const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
    const [chartOverride, setChartOverride] = useState<string | null>(null);
    const [showReasoning, setShowReasoning] = useState(true);

    /* Normalize data */
    const raw = useMemo(() => {
        if (!chartData) return null;
        return {
            chart_type: (chartData.chart_type || chartData.data?.chart_type || 'none') as string,
            title: chartData.title || chartData.data?.title || 'Analysis',
            reasoning: chartData.reasoning || chartData.data?.reasoning,
            labels: chartData.labels || chartData.data?.labels || [],
            datasets: (chartData.datasets || chartData.data?.datasets || []) as Dataset[],
        };
    }, [chartData]);

    const chartType = (chartOverride || raw?.chart_type || 'none') as string;
    const isPieLike = chartType === 'pie' || chartType === 'doughnut';

    /* Transform data */
    const data = useMemo(() => {
        if (!raw?.labels?.length || !raw?.datasets?.length) return [];
        return raw.labels.map((label, i) => {
            const pt: Record<string, any> = { name: label };
            raw.datasets.forEach(ds => { pt[ds.label] = ds.data[i] ?? 0; });
            return pt;
        });
    }, [raw]);

    /* Stats */
    const stats = useMemo(() => {
        if (!raw?.datasets?.length) return [];
        const vals = raw.datasets.flatMap(d => d.data.filter(v => typeof v === 'number'));
        if (!vals.length) return [];
        const sum = vals.reduce((a, b) => a + b, 0);
        return [
            { label: 'Total', value: fmt(sum) },
            { label: 'Average', value: fmt(sum / vals.length) },
            { label: 'Max', value: fmt(Math.max(...vals)) },
            { label: 'Points', value: vals.length.toString() },
        ];
    }, [raw]);

    /* Pie data */
    const pieData = useMemo(() => {
        if (!raw?.labels || !raw?.datasets?.[0]) return [];
        return raw.labels.map((name, i) => ({ name, value: raw.datasets[0].data[i] || 0 }))
            .filter(d => d.value > 0)
            .sort((a, b) => b.value - a.value);
    }, [raw]);

    const handleExport = useCallback(() => {
        if (data.length) downloadCSV(`${raw?.title || 'data'}.csv`, data);
    }, [data, raw?.title]);

    if (isLoading) {
        return (
            <div className="w-full bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-6 animate-pulse">
                <div className="h-5 bg-gray-100 dark:bg-neutral-800 rounded w-1/4 mb-3" />
                <div className="h-3 bg-gray-50 dark:bg-neutral-800/50 rounded w-1/2 mb-8" />
                <div className="h-[320px] bg-gray-50 dark:bg-neutral-800/30 rounded-lg" />
            </div>
        );
    }

    if (!raw || chartType === 'none' || !data.length) {
        return (
            <div className="w-full bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 p-6">
                <EmptyState />
            </div>
        );
    }

    /* ─── Render Chart ─── */
    const renderChart = () => {
        const axisCommon = {
            fontSize: THEME.font.size.sm,
            fontFamily: THEME.font.family,
            tickLine: false,
            axisLine: false,
        };

        const gridCommon = {
            strokeDasharray: '4 4',
            vertical: false,
            stroke: 'currentColor',
            className: 'text-gray-100 dark:text-neutral-800',
        };

        switch (chartType) {
            case 'bar':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                            <CartesianGrid {...gridCommon} />
                            <XAxis dataKey="name" {...axisCommon} dy={8} className="text-gray-400 dark:text-neutral-500" />
                            <YAxis {...axisCommon} className="text-gray-400 dark:text-neutral-500" tickFormatter={fmt} />
                            <Tooltip content={<TooltipContent />} cursor={{ fill: 'currentColor', className: 'text-gray-50 dark:text-neutral-800/50' }} />
                            {raw.datasets?.map((ds, i) => (
                                <Bar
                                    key={ds.label}
                                    dataKey={ds.label}
                                    fill={PALETTE[i % PALETTE.length]}
                                    radius={[4, 4, 0, 0]}
                                    maxBarSize={48}
                                    animationDuration={800}
                                    animationBegin={100}
                                >
                                    <LabelList
                                        dataKey={ds.label}
                                        position="top"
                                        className="text-[10px] fill-gray-400 dark:fill-neutral-500"
                                        formatter={(v: any) => v > 0 ? fmt(v) : ''}
                                    />
                                </Bar>
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
            case 'area':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data} margin={{ top: 20, right: 10, left: -10, bottom: 0 }}>
                            <defs>
                                {raw.datasets?.map((_ds, i) => (
                                    <linearGradient key={i} id={`fill-${i}`} x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0.15} />
                                        <stop offset="95%" stopColor={PALETTE[i % PALETTE.length]} stopOpacity={0} />
                                    </linearGradient>
                                ))}
                            </defs>
                            <CartesianGrid {...gridCommon} />
                            <XAxis dataKey="name" {...axisCommon} dy={8} className="text-gray-400 dark:text-neutral-500" />
                            <YAxis {...axisCommon} className="text-gray-400 dark:text-neutral-500" tickFormatter={fmt} />
                            <Tooltip content={<TooltipContent />} cursor={{ stroke: 'currentColor', className: 'text-gray-200 dark:text-neutral-700', strokeWidth: 1 }} />
                            {raw.datasets?.map((ds, i) => (
                                <>
                                    {chartType === 'area' && (
                                        <Area
                                            key={`area-${ds.label}`}
                                            type="monotone"
                                            dataKey={ds.label}
                                            stroke={PALETTE[i % PALETTE.length]}
                                            fill={`url(#fill-${i})`}
                                            strokeWidth={2}
                                            animationDuration={1000}
                                        />
                                    )}
                                    <Line
                                        key={`line-${ds.label}`}
                                        type="monotone"
                                        dataKey={ds.label}
                                        stroke={PALETTE[i % PALETTE.length]}
                                        strokeWidth={2.5}
                                        dot={false}
                                        activeDot={{ r: 4, strokeWidth: 0, fill: PALETTE[i % PALETTE.length] }}
                                        animationDuration={1000}
                                    />
                                </>
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                );

            case 'pie':
            case 'doughnut':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={chartType === 'doughnut' ? '58%' : '0%'}
                                outerRadius="80%"
                                dataKey="value"
                                paddingAngle={2}
                                label={({ percent }: any) => `${(percent * 100).toFixed(0)}%`}
                                labelLine={false}
                                stroke="none"
                                animationDuration={800}
                            >
                                {pieData.map((_, i) => (
                                    <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<TooltipContent />} />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'radar':
                return (
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart data={data} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                            <PolarGrid stroke="currentColor" className="text-gray-100 dark:text-neutral-800" />
                            <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: 'currentColor', className: 'text-gray-400 dark:text-neutral-500' }} />
                            <PolarRadiusAxis tick={{ fontSize: 10, fill: 'currentColor', className: 'text-gray-300 dark:text-neutral-600' }} />
                            <Tooltip content={<TooltipContent />} />
                            {raw.datasets?.map((ds, i) => (
                                <Radar
                                    key={ds.label}
                                    name={ds.label}
                                    dataKey={ds.label}
                                    stroke={PALETTE[i % PALETTE.length]}
                                    fill={PALETTE[i % PALETTE.length]}
                                    fillOpacity={0.15}
                                    strokeWidth={1.5}
                                />
                            ))}
                        </RadarChart>
                    </ResponsiveContainer>
                );

            default:
                return (
                    <div className="h-full flex items-center justify-center">
                        <div className="text-center">
                            <p className="text-sm font-medium text-orange-500">Unsupported: {chartType}</p>
                            <button onClick={() => setChartOverride('bar')} className="mt-2 text-xs text-sky-600 hover:underline">Switch to Bar</button>
                        </div>
                    </div>
                );
        }
    };

    /* ─── Render Table ─── */
    const renderTable = () => {
        if (!data.length) return null;
        const keys = Object.keys(data[0]);
        return (
            <div className="overflow-hidden rounded-lg border border-gray-100 dark:border-neutral-800">
                <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 dark:bg-neutral-800/50 text-[10px] uppercase text-gray-400 dark:text-neutral-500 font-semibold tracking-wider">
                        <tr>
                            {keys.map(k => (
                                <th key={k} className="px-3 py-2.5 font-medium">{k === 'name' ? 'Label' : k}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                        {data.map((row, i) => (
                            <tr key={i} className="hover:bg-gray-50/50 dark:hover:bg-neutral-800/30 transition-colors">
                                {keys.map(k => (
                                    <td key={k} className="px-3 py-2.5 text-gray-700 dark:text-neutral-300 tabular-nums">
                                        {typeof row[k] === 'number' ? fmt(row[k]) : row[k]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="w-full bg-white dark:bg-neutral-900 rounded-xl border border-gray-100 dark:border-neutral-800 overflow-hidden transition-colors">
            {/* Header */}
            <div className="px-6 pt-5 pb-0">
                <div className="flex flex-col  gap-4 mb-5">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-semibold text-gray-900 dark:text-white tracking-tight leading-snug">
                            {raw.title}
                        </h3>

                        {raw.reasoning && (
                            <div className="mt-2">
                                <button
                                    onClick={() => setShowReasoning(!showReasoning)}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 transition-colors"
                                >
                                    <IconInfo />
                                    <span>Agent Insight</span>
                                    <IconChevron down={showReasoning} />
                                </button>
                                {showReasoning && (
                                    <div className="mt-2 text-xs  text-gray-600 dark:text-neutral-300 bg-emerald-50/30 dark:bg-emerald-900/10 border border-emerald-100/50 dark:border-emerald-900/20 rounded-lg px-3 py-2.5 ">
                                        {raw.reasoning}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Chart Type */}
                        <div className="flex items-center bg-gray-100/80 dark:bg-neutral-800/80 rounded-lg p-0.5">
                            {CHART_MODES.filter(m => !['pie', 'doughnut'].includes(m.key) || raw.datasets?.length === 1).map((m) => {
                                const active = chartType === m.key;
                                return (
                                    <button
                                        key={m.key}
                                        onClick={() => setChartOverride(m.key)}
                                        className={`p-1.5 rounded-md transition-all ${active ? 'bg-white dark:bg-neutral-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'}`}
                                        title={m.label}
                                    >
                                        <m.icon />
                                    </button>
                                );
                            })}
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100/80 dark:bg-neutral-800/80 rounded-lg p-0.5">
                            <button onClick={() => setViewMode('chart')} className={`p-1.5 rounded-md transition-all ${viewMode === 'chart' ? 'bg-white dark:bg-neutral-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400'}`}><IconChart /></button>
                            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-md transition-all ${viewMode === 'table' ? 'bg-white dark:bg-neutral-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-400'}`}><IconTable /></button>
                        </div>

                        <button onClick={handleExport} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors" title="Export CSV">
                            <IconDownload />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                {stats.length > 0 && viewMode === 'chart' && !isPieLike && (
                    <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
                        {stats.map((s, i) => (
                            <StatPill key={i} label={s.label} value={s.value} color={i === 0 ? PALETTE[0] : undefined} />
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="px-6 pb-6">
                {viewMode === 'chart' ? (
                    <div className="h-[320px] w-full">
                        {renderChart()}
                    </div>
                ) : (
                    <div className="animate-in fade-in duration-300">
                        {renderTable()}
                    </div>
                )}
            </div>
        </div>
    );
}