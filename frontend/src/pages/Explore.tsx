import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css"; 
import { DOMAINS } from "../config/domains";
import { fetchDomainData, type DomainData } from "../api/dashboard";
import LineChartCard from "../components/LineChartCard";

function ExploreSection({ domainId, domainLabel, index }: { domainId: string, domainLabel: string, index: number }) {
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
                if (isMounted) setError(err.message || "Eroare la încărcare");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        
        loadData();
        return () => { isMounted = false; };
    }, [domainId, index]);

    return (
        <div style={{ marginBottom: '60px' }}>
            <div style={{ paddingBottom: '15px', borderBottom: '1px solid rgba(16, 185, 129, 0.3)', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', color: 'currentColor', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#10b981' }}></span>
                    {domainLabel}
                    {loading && <span style={{ fontSize: '14px', opacity: 0.6, marginLeft: '15px' }}>(Se așteaptă rândul...)</span>}
                </h2>
            </div>

            {error && <p style={{ color: '#ef4444' }}>{error}</p>}

            {data && !loading && (
                <div className={styles.chartsGrid}>
                    {data.charts.inflation && data.charts.inflation.length > 0 ? (
                        <LineChartCard title={`Inflație - ${domainLabel}`} data={data.charts.inflation} yAxisLabel="Indice Preț" lineColor="#ef4444" />
                    ) : null}
                    
                    {data.charts.consumption && data.charts.consumption.length > 0 ? (
                        <LineChartCard title={`Consum - ${domainLabel}`} data={data.charts.consumption} yAxisLabel="Volum" lineColor="#3b82f6" />
                    ) : null}
                    
                    {data.charts.trends && data.charts.trends.length > 0 ? (
                        <LineChartCard title={`Interes Public - ${domainLabel}`} data={data.charts.trends} yAxisLabel="Căutări" lineColor="#10b981" />
                    ) : null}
                </div>
            )}
        </div>
    );
}

export default function Explore() {
    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Baza de Date Completă</h1>
                <p className={styles.subtitle}>Testare: Aici poți vizualiza absolut toate graficele disponibile în platformă</p>
            </header>

            {DOMAINS.map((domain, index) => (
                <ExploreSection key={domain.id} domainId={domain.id} domainLabel={domain.label} index={index} />
            ))}
        </div>
    );
}