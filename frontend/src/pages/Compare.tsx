import { useState, useEffect, useMemo, useRef } from 'react';
import styles from './Compare.module.css';
import { fetchUserDomains, fetchDomainData, type DomainData } from '../api/dashboard';
import { DOMAINS } from '../config/domains';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Sparkles, TrendingUp, ShoppingCart, Search, ChevronDown } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import { Download } from 'lucide-react';
import { downloadCSV } from '../components/exportUtils';

const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const formatted = d.toLocaleDateString('ro-RO', { month: 'short', year: 'numeric' });
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
};

const mergeChartData = (dataLeft: any[], dataRight: any[], leftName: string, rightName: string) => {
    if (!dataLeft || !dataRight) return [];
    const mergedMap = new Map();
    
    dataLeft.forEach(point => {
        mergedMap.set(point.date, { date: point.date, [leftName]: point.value });
    });
    
    dataRight.forEach(point => {
        if (mergedMap.has(point.date)) {
            mergedMap.get(point.date)[rightName] = point.value;
        } else {
            mergedMap.set(point.date, { date: point.date, [rightName]: point.value });
        }
    });

    return Array.from(mergedMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const getLatestValue = (data?: any[]) => {
    if (!data || data.length === 0) return 0;
    return data[data.length - 1].value;
};

const CustomDropdown = ({ options, value, onChange }: { options: any[], value: string, onChange: (v: string) => void }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find(o => o.id === value)?.label || 'Selectează...';

    return (
        <div className={styles.dropdownContainer} ref={dropdownRef}>
            <div 
                className={`${styles.dropdownHeader} ${isOpen ? styles.dropdownHeaderActive : ''}`} 
                onClick={() => setIsOpen(!isOpen)}
            >
                {selectedLabel}
                <ChevronDown size={20} color="#64748b" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </div>
            {isOpen && (
                <div className={styles.dropdownList}>
                    {options.map(opt => (
                        <div 
                            key={opt.id} 
                            className={styles.dropdownItem} 
                            onClick={() => { onChange(opt.id); setIsOpen(false); }}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Compare() {
    const [userDomains, setUserDomains] = useState<any[]>([]);
    const [leftDomainId, setLeftDomainId] = useState<string>('');
    const [rightDomainId, setRightDomainId] = useState<string>('');
    const [leftData, setLeftData] = useState<DomainData | null>(null);
    const [rightData, setRightData] = useState<DomainData | null>(null);
    const [showAi, setShowAi] = useState(false);
    const [aiInsight, setAiInsight] = useState("");
    const [isAiLoading, setIsAiLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function loadUserDomains() {
            try {
                const domains = await fetchUserDomains();
                if (isMounted && domains.length > 0) {
                    setUserDomains(domains);
                    setLeftDomainId(domains[0].id);
                    setRightDomainId(DOMAINS.find(d => d.id !== domains[0].id)?.id || DOMAINS[1].id);
                }
            } catch (error) {
                console.error("Eroare la aducerea domeniilor pe Compare:", error);
            }
        }
        loadUserDomains();
        return () => { isMounted = false; };
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function loadComparisons() {
            if (!leftDomainId || !rightDomainId) return;
            try {
                const [resLeft, resRight] = await Promise.all([
                    fetchDomainData(leftDomainId),
                    fetchDomainData(rightDomainId)
                ]);
                if (isMounted) {
                    setLeftData(resLeft);
                    setRightData(resRight);
                    setShowAi(false);
                    setAiInsight("");
                }
            } catch (err) {
                console.error("Eroare la încărcarea datelor", err);
            }
        }
        loadComparisons();
        return () => { isMounted = false; };
    }, [leftDomainId, rightDomainId]);

    const handleAITrigger = async () => {
        setShowAi(true);
        setIsAiLoading(true);
        try {
            const token = sessionStorage.getItem('token');
            const leftName = DOMAINS.find(d => d.id === leftDomainId)?.label || leftDomainId;
            const rightName = DOMAINS.find(d => d.id === rightDomainId)?.label || rightDomainId;

            const res = await fetch("/api/compare-insights", {
                method: "POST",
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ domain_left: leftName, domain_right: rightName })
            });
            
            if (res.ok) {
                const data = await res.json();
                setAiInsight(data.insight);
            } else {
                setAiInsight("Nu am putut genera analiza comparativă momentan.");
            }
        } catch (error) {
            setAiInsight("A apărut o eroare la conexiunea cu AI-ul.");
        } finally {
            setIsAiLoading(false);
        }
    };

    const leftName = DOMAINS.find(d => d.id === leftDomainId)?.label || 'Domeniu A';
    const rightName = DOMAINS.find(d => d.id === rightDomainId)?.label || 'Domeniu B';

    const mergedInflation = useMemo(() => mergeChartData(leftData?.charts.inflation || [], rightData?.charts.inflation || [], leftName, rightName), [leftData, rightData, leftName, rightName]);
    const mergedConsumption = useMemo(() => mergeChartData(leftData?.charts.consumption || [], rightData?.charts.consumption || [], leftName, rightName), [leftData, rightData, leftName, rightName]);
    const mergedTrends = useMemo(() => mergeChartData(leftData?.charts.trends || [], rightData?.charts.trends || [], leftName, rightName), [leftData, rightData, leftName, rightName]);

    const ComparisonChart = ({ title, data, icon: Icon }: any) => (
        <div className={styles.chartCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 className={styles.chartTitle} style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Icon size={20} color="#8b5cf6" /> {title}
                </h3>
                <button 
                    onClick={() => downloadCSV(data, `comparatie_${title.replace(/\s+/g, '_').toLowerCase()}`)}
                    className={styles.chartActionButton} title='Descarcă CSV'>
                    <Download size={14} />
                </button>
            </div>
            
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={data} margin={{ top: 5, right: 10, bottom: 5, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.06)" />
                        <XAxis dataKey="date" tickFormatter={formatDate} tick={{fontSize: 12, fill: '#64748b'}} />
                        <YAxis tick={{fontSize: 12, fill: '#64748b'}} domain={['auto', 'auto']} />
                        <Tooltip 
                            labelFormatter={(label) => formatDate(label)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} 
                        />
                        <Legend wrapperStyle={{ paddingTop: '10px' }} />
                        <Line type="monotone" dataKey={leftName} stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                        <Line type="monotone" dataKey={rightName} stroke="#f97316" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );

    return (
        <PageTransition>
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Comparație Sectoare</h1>
                <p className={styles.subtitle}>Evaluează performanța domeniilor tale față de oricare alt sector din piață.</p>
            </header>

            <div className={styles.selectorsGrid}>
                <div className={styles.selectorColumn}>
                    <label className={styles.selectorLabel}>Domeniul Tău (Preferințe)</label>
                    <CustomDropdown options={userDomains} value={leftDomainId} onChange={setLeftDomainId} />
                </div>
                <div className={styles.selectorColumn}>
                    <label className={styles.selectorLabel}>Competiție (Piața Globală)</label>
                    <CustomDropdown options={DOMAINS.filter(d => d.id !== leftDomainId)} value={rightDomainId} onChange={setRightDomainId} />
                </div>
            </div>

            {leftData && rightData && (
                <div className={styles.kpiGrid}>
                    <div className={styles.kpiColumn}>
                        <div className={styles.kpiBox}>
                            <span className={styles.kpiLabel}>Inflație Curentă</span>
                            <span className={`${styles.kpiValue} ${styles.kpiLeft}`}>{getLatestValue(leftData.charts.inflation).toFixed(1)}%</span>
                        </div>
                        <div className={styles.kpiBox}>
                            <span className={styles.kpiLabel}>Interes Public (Scor)</span>
                            <span className={`${styles.kpiValue} ${styles.kpiLeft}`}>{getLatestValue(leftData.charts.trends)}</span>
                        </div>
                    </div>
                    <div className={styles.kpiColumn}>
                        <div className={styles.kpiBox}>
                            <span className={styles.kpiLabel}>Inflație Curentă</span>
                            <span className={`${styles.kpiValue} ${styles.kpiRight}`}>{getLatestValue(rightData.charts.inflation).toFixed(1)}%</span>
                        </div>
                        <div className={styles.kpiBox}>
                            <span className={styles.kpiLabel}>Interes Public (Scor)</span>
                            <span className={`${styles.kpiValue} ${styles.kpiRight}`}>{getLatestValue(rightData.charts.trends)}</span>
                        </div>
                    </div>
                </div>
            )}

            {leftData && rightData && (
                <div className={styles.chartsGrid}>
                    <ComparisonChart title="Evoluție Inflație (Prețuri)" data={mergedInflation} icon={TrendingUp} />
                    <ComparisonChart title="Volum Consum (Cerere)" data={mergedConsumption} icon={ShoppingCart} />
                    <div style={{ gridColumn: '1 / -1' }}>
                        <ComparisonChart title="Interes Public (Google Trends)" data={mergedTrends} icon={Search} />
                    </div>
                </div>
            )}

            <div className={styles.aiSection} style= {{ width: '100%', maxWidth: '100%', marginTop: '24px'}}>
                {!showAi ? (
                    <button className={styles.aiButton} onClick={handleAITrigger} style = {{width: '100%', justifyContent: 'center'}}>
                        <Sparkles size={20} />
                        Afișează comparația analizată de AI
                    </button>
                ) : (
                    <div className={styles.aiGlassCard} style= {{ width: '100%', maxWidth: '100%' }}>
                        <div className={styles.aiHeader}>
                            <Sparkles size={24} color="#8b5cf6" />
                            <h3 className={styles.aiTitle}>Analiză Comparativă Groq</h3>
                        </div>
                        {isAiLoading ? (
                            <p className={styles.aiText} style={{ opacity: 0.7 }}>Agentul analizează diferențele de piață...</p>
                        ) : (
                            <p className={styles.aiText}>{aiInsight}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    </PageTransition>
    );
}