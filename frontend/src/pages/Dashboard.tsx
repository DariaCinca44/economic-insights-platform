import {useEffect, useMemo, useState} from 'react'
import { fetchDashboard } from '../api/dashboard'
import LineChartCard from '../components/LineChartCard'
import Card from '../components/Card'
import DomainSelect from '../components/DomainSelect'
import {DOMAINS, type Domain, DEFAULT_DOMAIN} from '../config/domains'
import styles from './Dashboard.module.css'

type ChartPoint = { date: string; value: number}
type ChartData= {title?: string; points?: ChartPoint[]}
type DashboardData = { domain: string; label: string; charts?: { inflation?: ChartData; consumption?: ChartData, trends?: ChartData}}

export default function Dashboard() {
    const initialDomain= (localStorage.getItem("domain") as Domain) || DEFAULT_DOMAIN
    const [domain, setDomain] = useState<Domain>(initialDomain)
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState< boolean>(false)
    const [err, setErr]= useState<string>("")


    useEffect(() => {
        let cancelled = false

        async function run(){
            setLoading(true)
            setErr("")
            try{
                const json = (await fetchDashboard(domain)) as DashboardData
                if(!cancelled){
                    setData(json)
                }
            } catch(e: unknown){
                if(!cancelled){
                    const message = e instanceof Error ?  e.message: "Fetch error!" 
                    setErr(message)
                }
            } finally {
                if(!cancelled){
                    setLoading(false)
                }
            }
    } run()
    return() => { cancelled = true}}, [domain])

    const inflation = data?.charts?.inflation
    const consumption = data?.charts?.consumption
    const trends = data?.charts?.trends

    const title= useMemo(() => {
        const d= DOMAINS.find((x) => x.id === domain)
        return d? d.label : domain
    }, [domain])

    return(
       <div className={styles.container}>
        <div className={styles.header}>
            <div>
                <div className={styles.pageTitle}>Dashboard</div>
                <div className={styles.subtitle}>
                    Domeniu: {" "}
                    <span className={styles.subtitleHighlight}>{title}</span>
                </div>
            </div>
            <DomainSelect value={domain} onChange={setDomain} options={DOMAINS}/>
       </div>

       {loading && (
        <Card title="Loading...">
            <div className={styles.loadingText}> We are fetching the data for {title}, please wait! </div>
            <div className={styles.progressBarContainer}>
                <div className={styles.progressBar}/>
            </div>
        </Card>
        )}

        {err && (
            <div className={styles.errorBox}>{err}</div>
        )}

        {!loading && !err && (
            <div className={styles.contentGrid}>
                <div className={styles.chartsGrid}>
                    <LineChartCard title={inflation?.title || "Inflation"} points={inflation?.points || []}/>
                    <LineChartCard title={consumption?.title || "Consumption"} points={consumption?.points || []}/>
                    <LineChartCard title={trends?.title || "Trends"} points={trends?.points || []}/>
                </div>

                <Card title='Insights' className={styles.aiCard}>
                    <div className={styles.aiContent}> AI insights will be here! 
                        <div className={styles.aiFooter}> Last update: - </div>
                    </div>
                </Card>
            </div>
        )}
         </div>
    )
}