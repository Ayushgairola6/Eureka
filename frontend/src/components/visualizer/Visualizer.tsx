import { useMemo } from 'react';
import {
    BarChart, Bar, LineChart, Line, PieChart, Pie,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    XAxis, YAxis, CartesianGrid,
    Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function Visualizer({ chartData }: any) {
    // 1. Memoize transformation to optimize performance
    const data = useMemo(() => {
        if (!chartData?.labels || !chartData?.datasets) return [];

        return chartData.labels.map((label: any, i: string | number) => {
            const point: Record<string, any> = { name: label };
            chartData.datasets.forEach((ds: { label: string | number; data: { [x: string]: number; }; }) => {
                // Safety check: ensure data exists at index i
                point[ds.label] = ds.data[i] ?? 0;
            });
            return point;
        });
    }, [chartData]);

    if (!chartData || chartData.chart_type === 'none') {
        return (
            <div className="p-12 text-center border-2 border-dashed border-gray-200 dark:border-neutral-800 rounded-xl">
                <p className="text-gray-500">No quantifiable data available for this section.</p>
            </div>
        );
    }

    const commonProps = {
        width: "100%",
        height: 400
    };

    const renderChart = () => {
        // Shared components to keep JSX clean
        const commonElements = [
            <CartesianGrid key="grid" strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />,
            <XAxis key="x" dataKey="name" fontSize={12} tickLine={false} axisLine={false} />,
            <YAxis key="y" fontSize={12} tickLine={false} axisLine={false} />,
            <Tooltip
                key="tooltip"
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />,
            <Legend key="legend" verticalAlign="top" height={36} />
        ];

        switch (chartData.chart_type) {
            case 'bar':
                return (
                    <ResponsiveContainer {...commonProps}>
                        <BarChart data={data}>
                            {commonElements}
                            {chartData.datasets.map((ds: any, i: number) => (
                                <Bar key={ds.label} dataKey={ds.label} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} />
                            ))}
                        </BarChart>
                    </ResponsiveContainer>
                );

            case 'line':
                return (
                    <ResponsiveContainer {...commonProps}>
                        <LineChart data={data}>
                            {commonElements}
                            {chartData.datasets.map((ds: any, i: number) => (
                                <Line
                                    key={ds.label}
                                    type="monotone"
                                    dataKey={ds.label}
                                    stroke={COLORS[i % COLORS.length]}
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                            ))}
                        </LineChart>
                    </ResponsiveContainer>
                );

            case 'pie':
            case 'doughnut':
                const pieData = chartData.labels.map((label: any, i: string | number) => ({
                    name: label,
                    value: chartData.datasets[0]?.data[i] || 0
                }));
                return (
                    <ResponsiveContainer {...commonProps}>
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={chartData.chart_type === 'doughnut' ? 70 : 0}
                                outerRadius={100}
                                dataKey="value"
                                paddingAngle={5}
                                label
                            >
                                {pieData.map((_: any, i: number) => (
                                    <Cell key={`cell-${i}`} fill={COLORS[i % COLORS.length]} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                );

            case 'radar':
                return (
                    <ResponsiveContainer {...commonProps}>
                        <RadarChart data={data}>
                            <PolarGrid stroke="#374151" opacity={0.2} />
                            <PolarAngleAxis dataKey="name" />
                            <PolarRadiusAxis />
                            <Tooltip />
                            {chartData.datasets.map((ds: any, i: number) => {
                                const label = ds.label != null ? String(ds.label) : `dataset-${i}`;

                                return (
                                    <Radar
                                        key={label}
                                        name={label}
                                        dataKey={label}
                                        stroke={COLORS[i % COLORS.length]}
                                        fill={COLORS[i % COLORS.length]}
                                        fillOpacity={0.4}
                                    />
                                );
                            })}
                        </RadarChart>
                    </ResponsiveContainer>
                );

            default:
                return <div className="p-8 text-center text-orange-500">Unsupported chart type: {chartData.chart_type}</div>;
        }
    };

    return (
        <div className="w-full bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-gray-100 dark:border-neutral-800 p-6 transition-all">
            <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">{chartData.title}</h3>
                {chartData.reasoning && (
                    <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2 italic">{chartData.reasoning}</p>
                )}
            </div>
            <div className="h-[400px] w-full">
                {renderChart()}
            </div>
        </div>
    );
}