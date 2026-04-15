import { useEffect, useState } from "react";
import styles from "./Dashboard.module.css";
import { fetchUserDomains, fetchDomainData, type DomainData } from "../api/dashboard";
import LineChartCard from "../components/LineChartCard";

function DashboardSection({ domainId, domainLabel, index }: { domainId: string, domainLabel: string, index: number }) {
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

    return (
        <div style={{ marginBottom: '60px' }}>
            <div style={{ paddingBottom: '15px', borderBottom: '1px solid rgba(139, 92, 246, 0.3)', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '24px', color: 'currentColor', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'inline-block', width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#8b5cf6' }}></span>
                    {domainLabel}
                    {loading && <span style={{ fontSize: '14px', opacity: 0.6, marginLeft: '15px' }}>(Se încarcă...)</span>}
                </h2>
            </div>

            {error && <p style={{ color: '#ef4444' }}>{error}</p>}

            {data && !loading && (
                <div className={styles.chartsGrid}>
                    {data.charts.inflation && data.charts.inflation.length > 0 && (
                        <LineChartCard title={`Inflație - ${domainLabel}`} data={data.charts.inflation} yAxisLabel="Indice Preț" lineColor="#ef4444" />
                    )}
                    {data.charts.consumption && data.charts.consumption.length > 0 && (
                        <LineChartCard title={`Consum - ${domainLabel}`} data={data.charts.consumption} yAxisLabel="Volum" lineColor="#3b82f6" />
                    )}
                    {data.charts.trends && data.charts.trends.length > 0 && (
                        <LineChartCard title={`Interes Public - ${domainLabel}`} data={data.charts.trends} yAxisLabel="Căutări" lineColor="#10b981" />
                    )}
                </div>
            )}
        </div>
    );
}

export default function Dashboard() {
    const [domains, setDomains] = useState<{id: string, label: string}[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function init() {
            try {
                const list = await fetchUserDomains();
                setDomains(list);
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    if (loading) return <div className={styles.container}><h2 style={{ color: 'currentColor' }}>Se citește profilul...</h2></div>;
    if (domains.length === 0) return <div className={styles.container}>Nu s-au găsit domenii. Mergi la Setări pentru a alege preferințele.</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Analiză Economică Globală</h1>
                <p className={styles.subtitle}>Afișare pe baza preferințelor tale din profil</p>
            </header>

            {domains.map((domain, index) => (
                <DashboardSection key={domain.id} domainId={domain.id} domainLabel={domain.label} index={index} />
            ))}
        </div>
    );
}