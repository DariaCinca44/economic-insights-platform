import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css"; 
import { fetchDomainData, type DomainData } from "../api/dashboard";
import LineChartCard from "../components/LineChartCard";
import { Pin, ChevronRight } from "lucide-react";
import { fetchUserDomains } from "../api/dashboard";
import { usePinnedGraphs } from "../hooks/usePinnedGraphs";
import PageTransition from "../components/PageTransition";
import { Download } from "lucide-react";
import { downloadCSV } from "../components/exportUtils";
import CorrelationCard from "../components/CorrelationCard";

function ExploreSection({ domainId, domainLabel, index, pinnedGraphs, onTogglePin }: { domainId: string, domainLabel: string, index: number, pinnedGraphs: string[], onTogglePin: (chartId: string) => void }) {
    const [data, setData] = useState<DomainData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        let isMounted = true;
        
        async function loadData() {
           await new Promise(resolve => setTimeout(resolve, index * 800));
            
            if (!isMounted) return;

            try {
                setLoading(true);
                const res = await fetchDomainData(domainId);
                if (isMounted) setData(res);
            } catch (err: any) {
                if (isMounted) setError(err.message || "Eroare la incarcare");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        
        loadData();
        return () => { isMounted = false; };
    }, [domainId, index]);

    const renderChart = (type: string, title: string, chartData: any[] | undefined, yAxisLabel: string, lineColor: string) => {
        if (!chartData || chartData.length === 0) return null;

        const chartId = `${domainId}-${type}`;
        const isPinned = pinnedGraphs.includes(chartId);

        return (
            <div style={{ position: 'relative' }}>
                <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 10, display: 'flex', gap: '8px' }}>
                    <button
                        className={styles.chartActionButton}
                        onClick={() => downloadCSV(chartData, title.replace(/\s+/g, '_').toLowerCase())}
                        title="Exportă CSV"
                    >
                        <Download size={18} />
                    </button>
                    
                    <button
                        onClick={() => onTogglePin(chartId)}
                        className={styles.chartActionButton}
                        style={isPinned ? { background: '#8b5cf6', color: 'white', border: 'none' } : {}}
                        title={isPinned ? "Scoate de pe Dashboard" : "Fixează pe Dashboard"}
                    >
                        <Pin size={18} style={{ fill: isPinned ? "currentColor" : "none" }} />
                    </button>
                    
                </div> 
                    <LineChartCard title={title} data={chartData} yAxisLabel={yAxisLabel} lineColor={lineColor} />
            </div>
        );
    }

    return (
        <div style={{ marginBottom: '60px' }}>
            <div style={{ paddingBottom: '15px', borderBottom: '1px solid rgba(139, 92, 246, 0.5)', marginBottom: '30px' }}>
                <h2 style={{ fontSize: '24px', color: 'currentColor', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <ChevronRight size={26} color="#8b5cf6" strokeWidth={2.5} />
                    {domainLabel}
                    {loading && <span style={{ fontSize: '14px', opacity: 0.6, marginLeft: '15px' }}>(Se incarca datele...)</span>}
                </h2>
            </div>

            {error && <p style={{ color: '#ef4444' }}>{error}</p>}

            {data && !loading && (
                <>
                    <div className={styles.chartsGrid}>
                        {renderChart('inflation', `Inflatie - ${domainLabel}`, data.charts.inflation, 'Indice Pret', '#ef4444')}
                        {renderChart('consumption', `Consum - ${domainLabel}`, data.charts.consumption, 'Unitati', '#3b82f6')}
                        {renderChart('trends', `Interes Public - ${domainLabel}`, data.charts.trends, 'Indice', '#10b981')}
                    </div>

                    <CorrelationCard
                        domainLabel={domainLabel}
                        trendsData={data.charts.trends || []}
                        consumptionData={data.charts.consumption || []}
                    />
                </>
            )}
        </div>
    );
}

export default function Explore() {
    const [userDomains, setUserDomains] = useState<any []>([]);
    const {pinnedGraphs, togglePin} = usePinnedGraphs();

    useEffect(() => {
        let isMounted = true;
        async function loadDomains() {
            try{
                const domains = await fetchUserDomains();
                if (isMounted) setUserDomains(domains);
            } catch (error) {
                console.error("Eroare la incarcarea domeniilor utilizatorului:", error);
            }
        }
        loadDomains();
        return () => { isMounted = false; }
    }, []);

    return (
        <PageTransition>
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Explorează graficele</h1>
                <p className={styles.subtitle}>Aici găsești toate graficele din domeniile tale de interes. Folosește iconița de Pin pentru a le adăuga pe Dashboard (Maxim 4).</p>
            </header>

            {userDomains.length > 0 ? (
                userDomains.map((domain, index) => (
                    <ExploreSection 
                        key={domain.id} 
                        domainId={domain.id} 
                        domainLabel={domain.label} 
                        index={index} 
                        pinnedGraphs={pinnedGraphs}
                        onTogglePin={togglePin}
                    />
                ))
            ) : (
                <p style={{textAlign: 'center', marginTop: '50px', color: '#6b7280'}}>Nu ai niciun domeniu selectat în preferințe.</p>
            )}
        </div>
        </PageTransition>
    );
}