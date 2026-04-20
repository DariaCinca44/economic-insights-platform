import { useEffect, useState, useMemo } from "react";
import { usePinnedGraphs } from "../hooks/usePinnedGraphs";
import styles from "./Dashboard.module.css";
import { fetchUserDomains, fetchDomainData, type DataPoint } from "../api/dashboard"; 
import LineChartCard from "../components/LineChartCard";
import Card from "../components/Card";
import GraphModal from "../components/GraphModal";
import AnimatedKPI from "../components/AnimatedKPI";
import {Pin} from "lucide-react";
import PageTransition from "../components/PageTransition";
import {Download} from "lucide-react";
import { downloadCSV } from "../components/exportUtils";

type UnifiedChart = { 
    id: string; 
    title: string; 
    points: DataPoint[]; 
    lineColor: string; 
    yAxisLabel: string;
};

export default function Dashboard() {
    const [allAvailableCharts, setAllAvailableCharts] = useState<UnifiedChart[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [err, setErr] = useState<string>("");
    
    const { pinnedGraphs, togglePin } = usePinnedGraphs();
    const [selectedGraph, setSelectedGraph] = useState<UnifiedChart | null>(null);

    useEffect(() => {
        let isMounted = true;

        async function loadAllDashboardData() {
            setLoading(true);
            setErr("");
            
            try {
                const domains = await fetchUserDomains();
                const chartsAccumulator: UnifiedChart[] = [];

                const fetchPromises = domains.map(async (domain) => {
                    try {
                        const domainData = await fetchDomainData(domain.id);
                        if (domainData && domainData.charts) {
                            
                            if (domainData.charts.inflation && domainData.charts.inflation.length > 0) {
                                chartsAccumulator.push({ 
                                    id: `${domain.id}-inflation`, 
                                    title: `Inflație - ${domain.label}`, 
                                    points: domainData.charts.inflation,
                                    lineColor: "#ef4444",
                                    yAxisLabel: "Indice Preț"
                                });
                            }
                            if (domainData.charts.consumption && domainData.charts.consumption.length > 0) {
                                chartsAccumulator.push({ 
                                    id: `${domain.id}-consumption`, 
                                    title: `Consum - ${domain.label}`, 
                                    points: domainData.charts.consumption,
                                    lineColor: "#3b82f6", 
                                    yAxisLabel: "Volum"
                                });
                            }
                            if (domainData.charts.trends && domainData.charts.trends.length > 0) {
                                chartsAccumulator.push({ 
                                    id: `${domain.id}-trends`, 
                                    title: `Interes Public - ${domain.label}`, 
                                    points: domainData.charts.trends,
                                    lineColor: "#10b981", 
                                    yAxisLabel: "Căutări"
                                });
                            }
                        }
                    } catch (e) {
                        console.error(`Eroare la aducerea datelor pentru domeniul ${domain.label}`, e);
                    }
                });

                await Promise.all(fetchPromises);

                if (isMounted) {
                    setAllAvailableCharts(chartsAccumulator);
                    setLoading(false);
                }
            } catch (error: any) {
                if (isMounted) {
                    setErr(error.message || "Eroare la preluarea datelor generale.");
                    setLoading(false);
                }
            }
        }

        loadAllDashboardData();

        return () => { isMounted = false; };
    }, []);
    
    const kpiData = useMemo(() => {
        if (!allAvailableCharts.length) return [];

        const inflationCharts = allAvailableCharts.filter(c => c.id.includes('inflation'));
        let avgInflation = 0;
        let inflationStatus = "Stabil";
        let inflationColor = "#10b981";

        if (inflationCharts.length > 0) {
            const sum = inflationCharts.reduce((acc, chart) => 
                acc + (chart.points[chart.points.length -1]?.value || 0), 0);
                avgInflation = sum / inflationCharts.length;

                if (avgInflation > 7) {
                    inflationStatus = "Alarmant";
                    inflationColor = "#ef4444";
                } else if (avgInflation > 3) {
                    inflationStatus = "In crestere";
                    inflationColor = "#f59e0b";
                } else {
                    inflationStatus = "Stabil";
                    inflationColor = "#10b981";
                }
        }

        const trendCharts = allAvailableCharts.filter(c => c.id.includes('trends'));
        let avgTrends = 0;
        let trendStatus = "Constant";
        let trendColor = "#3b82f6";

        if (trendCharts.length > 0) {
            const sumTrends = trendCharts.reduce((acc, chart) => acc + (chart.points[chart.points.length - 1]?.value || 0), 0);
            avgTrends = sumTrends / trendCharts.length;

            if (avgTrends > 70){
                trendStatus = "Popularitate Maxima";
                trendColor = "#8b5cf6";
            } else if (avgTrends > 40){
                trendStatus = "În creștere";
                trendColor = "#3b82f6";
            } else {
                trendStatus = "Interes Moderat";
                trendColor = "#6b7280";
            }
        }

        const uniqueDomains = new Set(allAvailableCharts.map(c => c.id.split('-')[0])).size;

        return [
            { 
                title: "Inflație Medie", 
                value: avgInflation, 
                suffix: "%", 
                status: inflationStatus, 
                color: inflationColor, 
                isDecimal: true 
            },
            { 
                title: "Interes Public Global", 
                value: avgTrends, 
                suffix: " pct", 
                status: trendStatus, 
                color: trendColor, 
                isDecimal: false 
            },
            { 
                title: "Acoperire Date", 
                value: uniqueDomains, 
                suffix: uniqueDomains === 1 ? " Sector" : " Sectoare", 
                status: "Monitorizate active", 
                color: "#10b981", 
                isDecimal: false 
            }
        ];
    }, [allAvailableCharts]);

    const displayedGraphs = useMemo(() => {
        const pinned = allAvailableCharts.filter(chart => pinnedGraphs.includes(chart.id));
        const unpinned = allAvailableCharts.filter(chart => !pinnedGraphs.includes(chart.id));
        return [...pinned, ...unpinned].slice(0,4);
    }, [allAvailableCharts, pinnedGraphs]);

    return (
        <PageTransition>
        <div className={styles.container}>
                <header className={styles.header}>
                    <h1 className={styles.title}>Dashboard</h1>
                    <p className={styles.subtitle}>
                        Monitorizează indicatorii cheie pentru afacerea ta. <strong>Apasă pe oricare grafic</strong> pentru a debloca analize detaliate și sfaturi strategice generate de AI.
                    </p>
                </header>

            {loading && (
                <Card title="Analizăm baza de date...">
                    <div className={styles.loadingText}> Adunăm datele din toate domeniile tale, te rugăm așteaptă! </div>
                    <div className={styles.progressBarContainer}>
                        <div className={styles.progressBar} />
                    </div>
                </Card>
            )}

            {err && (
                <div className={styles.errorBox}>{err}</div>
            )}

            {!loading && !err && (
                <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginTop: '10px', marginBottom: '30px' }}>
                        {kpiData.map((kpi, index) => (
                            <AnimatedKPI key={index} {...kpi} />
                        ))}
                </div>

              <div className={styles.chartsGrid} style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '24px', marginTop: '20px' }}>
                    {displayedGraphs.map((graph) => {
                        const isPinned = pinnedGraphs.includes(graph.id);
                        
                        return (
                            <div key={graph.id} style={{ position: 'relative' }}>
                                <div onClick={() => setSelectedGraph(graph)} style={{ cursor: 'pointer', height: '100%' }}>
                                    <LineChartCard 
                                        title={graph.title} 
                                        data={graph.points} 
                                        lineColor={graph.lineColor}
                                        yAxisLabel={graph.yAxisLabel}
                                    />
                                </div>
                                
                                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
                                    <button className={styles.chartActionButton} onClick={(e) => { e.stopPropagation(); downloadCSV(graph.points, `date_${graph.id}`);}} title="Exportă CSV" >
                                    <Download size={18} />
                                    </button>

                                <button
                                    className={styles.chartActionButton}
                                    onClick={(e) => { e.stopPropagation(); togglePin(graph.id);}}
                                    style={isPinned ? { background: '#8b5cf6', color: 'white', border: 'none' } : {}}
                                    title={isPinned ? "Scoate de pe Dashboard" : "Fixează pe Dashboard"} >
                                    <Pin size={18} style={{ fill: isPinned ? "currentColor" : "none" }} />
                                </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </>
            )}

            {selectedGraph && (
                <GraphModal 
                    graph={{ 
                        id: selectedGraph.id, 
                        title: selectedGraph.title, 
                        points: selectedGraph.points,
                        lineColor: selectedGraph.lineColor,
                        yAxisLabel: selectedGraph.yAxisLabel
                    }} 
                    onClose={() => setSelectedGraph(null)} 
                />
            )}
        </div>
        </PageTransition>
    );
}