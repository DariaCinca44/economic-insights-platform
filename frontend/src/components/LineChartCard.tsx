import {Line, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, ResponsiveContainer} from 'recharts'
import Card from './Card'
import styles from './LineChartCard.module.css'

export type ChartPoint = { date: string; value: number}
type Props = {title: string; points: ChartPoint[]}

function formatMonth(iso: string): string{
    const d= new Date(iso)
    const y= d.getFullYear()
    const m = String(d.getMonth()+1).padStart(2,'0')
    return `${y}-${m}`
}

export default function LineChartCard({title, points}: Props) { 
    const data = (points || []).map((p) => ({
        date: p.date,
        month: formatMonth(p.date),
        value: Number(p.value)
    }))

    const empty= !Array.isArray(points) || points.length === 0

    return(
       <Card title={title}>
        {empty ? (
            <div className={styles.emptyState}>
                No data to display
            </div>
        ): (
            <div className={styles.chartContainer}>
                <ResponsiveContainer width='100%' height='100%'>
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray= '3 3'/>
                        <XAxis dataKey= 'month' minTickGap={28}/>
                        <YAxis/>
                        <Tooltip/>
                        <Line type='monotone' dataKey='value' dot={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        )}
       </Card>
    )
}