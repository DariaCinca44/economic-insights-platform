import {useState, useEffect} from 'react'
import PageTransition from '../components/PageTransition'
import Card from '../components/Card'
import { CartesianGrid, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Area, Line } from 'recharts'
import DomainSelect from '../components/DomainSelect'
import {DOMAINS, type Domain} from '../config/domains'
import styles from './Forecast.module.css'

export default function Forecast() {
    const initialDomain = localStorage.getItem('domain') as Domain || 'CP01'
    const [domain, setDomain] = useState<Domain>(initialDomain)
    const [months, setMonths] = useState(6)
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        async function load(){
            setLoading(true)
            const token= localStorage.getItem('token')
            const res= await fetch(`/api/forecast?domain=${domain}&months=${months}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const json= await res.json()
            setData(json)
            setLoading(false)
        }
        load()
    }, [domain,months])

    const chartData = data?.data || [];
    const historicalData = chartData.filter((p:any) => !p.is_future);
    const lastHistoricalPoint = historicalData.length > 0 ? historicalData[historicalData.length - 1] : null;
    const futureData = chartData.filter((p: any) => p.is_future || p === lastHistoricalPoint);

    return(
        <PageTransition>
            <div className={styles.headerContainer}>
                <h1 className={styles.pageTtitle}>Forecast AI</h1>
                <div style= {{marginTop: '15px'}}>
                    <DomainSelect value={domain} onChange={setDomain} options={DOMAINS}/>
                </div>
            <div className={styles.monthsToggleGroup}>
                {[3,6,12].map(m =>(
                    <button key={m} onClick={() => setMonths(m)} className={`${styles.monthButton} ${months === m ? styles.monthButtonActive : styles.monthButtonInactive}`}>{m} Months</button>
                ))}
            </div>
            </div>

            <div className={styles.gridContainer}>
                <Card title={data?.title || 'Loading...'}>
                    {loading ? (
                        <div className={styles.loadingContainer}>
                           Loading forecast data...
                        </div>
                    ) : (
                        <div className={styles.chartContainer}>
                            <ResponsiveContainer width="100%" height='100%'>
                                <ComposedChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey= 'date' tickFormatter={(str)=> str.substring(0,7)} />
                                    <YAxis domain = {['auto' , 'auto']}/>
                                    <Tooltip />

                                    <Area type='monotone' dataKey='yhat_upper' stroke ='none' fill='#8b5cf6' fillOpacity={0.1} />
                                    <Area type='monotone' dataKey='yhat_lower' stroke ='none' fill='#8b5cf6' fillOpacity={0.1} />
                                    <Line type='monotone' dataKey='yhat' stroke='#8b5cf6' strokeWidth={3} dot={false} connectNulls={true} data={historicalData}/>
                                    <Line type='monotone' dataKey='yhat' stroke='#8b5cf6' strokeWidth={3} strokeDasharray='5 5' dot={false} connectNulls={true} data={futureData}/>
                                </ComposedChart>  
                            </ResponsiveContainer>
                        </div>
                    )}              
                </Card>

                {!loading && data?.ai_insight && (
                    <div className={styles.aiCard}>
                        <div className={styles.aiHeader}>
                            <span className={styles.aiIcon}>🧠</span>
                            <h3 className={styles.aiTitle}>Insights</h3>
                        </div>
                        <p className={styles.aiText}>"{data.ai_insight}"</p>
                        <div className={styles.aiBadges}>
                            <span className={styles.aiBadge}>Model: Gemini 2.5 Flash</span>
                            <span className={styles.aiBadge}>Confidence: {data.confidence}%</span>
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    )

}