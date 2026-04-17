import { useState, useEffect } from 'react'
import PageTransition from '../components/PageTransition'
import { CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, Line, Legend } from 'recharts'
import { DOMAINS } from '../config/domains'
import { Brain, CalendarClock } from 'lucide-react'
import styles from './Forecast.module.css'

function ForecastSection({ domainId, domainLabel }: { domainId: string, domainLabel: string }) {
    const [months, setMonths] = useState(6)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState("")

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setLoading(true)
            setError("")
            try {
                const token = localStorage.getItem('token')
                const res = await fetch(`/api/forecast?domain=${domainId}&months=${months}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
                if (!res.ok) throw new Error("A apărut o problemă la generarea predicției.")
                const json = await res.json()
                
                if (isMounted) setData(json)
            } catch (err: any) {
                if (isMounted) setError(err.message)
            } finally {
                if (isMounted) setLoading(false)
            }
        }
        load()
        return () => { isMounted = false }
    }, [domainId, months])

    const rawChartData = data?.data || [];
    rawChartData.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const lastHistIndex = rawChartData.findLastIndex((p: any) => !p.is_future);

    const chartData = rawChartData.map((point: any, index: number) => {
        const isConnectionPoint = index === lastHistIndex;
        
        return {
            ...point,
            yhat_history: !point.is_future ? point.yhat : null,
            yhat_forecast: (point.is_future || isConnectionPoint) ? point.yhat : null,
        };
    });

    return (
        <div className={styles.sectionContainer}>
            {error && <div style={{color: '#ef4444', marginBottom: '15px'}}>{error}</div>}

            <div className={styles.contentGrid}>
                <div className={styles.chartCard}>
                    
                    <div className={styles.chartHeader}>
                        <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                            <CalendarClock size={20} color="#8b5cf6" />
                            Predicție: {domainLabel}
                        </h2>

                        <div className={styles.monthsToggleGroup}>
                            {[3, 6, 12].map(m => (
                                <button 
                                    key={m} 
                                    onClick={() => setMonths(m)} 
                                    className={`${styles.monthButton} ${months === m ? styles.monthButtonActive : styles.monthButtonInactive}`}
                                    disabled={loading}
                                >
                                    {m} Luni
                                </button>
                            ))}
                        </div>
                    </div>

                    {loading ? (
                        <div className={styles.loadingContainer}>
                            <div className={styles.spinner}></div>
                            <p>Algoritmii noștri calculează predicția...</p>
                        </div>
                    ) : (
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height="100%">
                                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.04)" />
                                    <XAxis dataKey='date' tickFormatter={(str) => str.substring(0, 7)} tick={{fontSize: 12}} />
                                    <YAxis tick={{fontSize: 12}} domain={['auto', 'auto']} />
                                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)',backgroundColor: 'rgba(255, 255, 255, 0.95)' }} labelStyle={{ color: '#0f172a', fontWeight: 'bold',marginBottom: '5px' }} labelFormatter={(label) => { const date = new Date(label); const formattedDate = date.toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' }); return formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1); }} />
                                    <Legend wrapperStyle={{ paddingTop: '10px' }}/>

                                    <Area type='monotone' dataKey={['yhat_lower', 'yhat_upper'] as any} name="Interval Predictiv" stroke='none' fill='#8b5cf6' fillOpacity={0.15} connectNulls />

                                    <Line type='monotone' dataKey='yhat_history' name="Istoric Confirmat" stroke='#3b82f6' strokeWidth={3} dot={false} connectNulls />

                                    <Line type='monotone' dataKey='yhat_forecast' name="Predicție AI (Forecast)" stroke='#8b5cf6' strokeWidth={3} strokeDasharray='8 5' dot={false} connectNulls />
                                </ComposedChart>
                            </ResponsiveContainer>
                        </div>
                    )}              
                </div>

                <div className={styles.aiGlassCard}>
                    <div className={styles.aiHeader}>
                        <Brain size={24} color="#8b5cf6" />
                        <h3 className={styles.aiTitle}>Analiză Strategică</h3>
                    </div>
                    
                    <div className={styles.aiContentBox}>
                        {loading ? (
                            <p className={styles.aiThinking}>Agentul Groq analizează trendurile...</p>
                        ) : data?.ai_insight ? (
                            <p className={styles.aiText}>{data.ai_insight}</p>
                        ) : (
                            <p className={styles.aiText}>Nu s-au putut genera insight-uri.</p>
                        )}
                    </div>

                    {!loading && data && (
                        <div className={styles.aiBadges}>
                            <span className={styles.aiBadge}>Groq Llama 3</span>
                            <span className={styles.aiBadge} style={{marginLeft: 'auto'}}>Viitor: 2026</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Forecast() {
    const [userDomains, setUserDomains] = useState<typeof DOMAINS>([]);

    useEffect(() => {
        const isAll = localStorage.getItem('isAllDomains') === 'true';
        if (isAll) {
            setUserDomains(DOMAINS);
        } else {
            const primary = localStorage.getItem('domain') || "";
            const secondary = JSON.parse(localStorage.getItem('secondaryDomains') || '[]');
            const selectedIds = [primary, ...secondary].filter(Boolean);
            
            if (selectedIds.length > 0) {
                setUserDomains(DOMAINS.filter(d => selectedIds.includes(d.id)));
            } else {
                setUserDomains(DOMAINS);
            }
        }
    }, []);

    return(
        <PageTransition>
            <header className={styles.header}>
                <h1 className={styles.title}>Predictii</h1>
                <p className={styles.subtitle}>
                    Anticipam evoluția din 2026 cu ajutorul modelului matematic Prophet.
                </p>
            </header>

            {userDomains.map(domain => (
                <ForecastSection key={domain.id} domainId={domain.id} domainLabel={domain.label} />
            ))}

        </PageTransition>
    )
}