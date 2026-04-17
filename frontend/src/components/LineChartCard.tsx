import {Line, CartesianGrid, XAxis, YAxis, Tooltip, LineChart, ResponsiveContainer, Label, Legend} from 'recharts'
import styles from './LineChartCard.module.css'

interface DataPoint{
    date: string;
    value: number;
}

interface Props{
    title: string;
    data: DataPoint[];
    xAxisLabel? : string;
    yAxisLabel? : string;
    lineColor? : string;
    height?: number | string;
}

export default function LineChartCard({title, data, xAxisLabel = "Timp (luni)", yAxisLabel= "Valore", lineColor= "#8b5cf6", height=300} : Props){
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ro-RO', { month: 'short', year: '2-digit'});
    }

    return (
        <div className={styles.card} style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
            <div className={styles.cardHeader}>
                <h3 className={styles.cardTitle}>{title}</h3>
            </div>
            
            <div className={styles.chartContainer} style={{ width: '100%', height: height, marginTop: '20px', flexGrow: 1 }}>
                {data && data.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 20, left: 10 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} vertical={false} />
                            
                            <XAxis 
                                dataKey="date" 
                                tickFormatter={formatDate}
                                stroke="currentColor" 
                                opacity={0.6}
                                fontSize={11}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                            >

                                <Label value={xAxisLabel} offset={-10} position="insideBottom" fill="currentColor" opacity={0.6} fontSize={12} />
                            </XAxis>
                            
                            <YAxis 
                                stroke="currentColor" 
                                fontSize={11}
                                opacity={0.6}
                                tickMargin={10}
                                axisLine={false}
                                tickLine={false}
                                domain={['auto', 'auto']}
                            >
                                <Label value={yAxisLabel} angle={-90} position="insideLeft" fill="currentColor" opacity={0.6} fontSize={12} style={{textAnchor: 'middle'}}/>
                            </YAxis>
                            
                            <Tooltip 
                                contentStyle={{ 
                                    backgroundColor: "var(--card-bg, #ffffff)", 
                                    borderColor: lineColor,
                                    borderRadius: '8px',
                                    color: "var(--text-primary, #000)",
                                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                                }}
                                labelFormatter={(label) => new Date(label as string).toLocaleDateString('ro-RO', { month: 'long', year: 'numeric' })}
                            />

                            <Legend verticalAlign='top' height={36} wrapperStyle={{fontSize: "12px", opacity: 0.8}}></Legend>
                            
                            <Line 
                                name={title.split("-")[0].trim()}
                                type="monotone" 
                                dataKey="value" 
                                stroke={lineColor} 
                                strokeWidth={3} 
                                dot={false} 
                                activeDot={{ r: 6, fill: "#8b5cf6", stroke: "#fff", strokeWidth: 2 }} 
                            />
                        </LineChart>
                    </ResponsiveContainer>
                ) : (
                    <div style={{ display: 'flex', height: '100%', justifyContent: 'center', alignItems: 'center', color: 'rgba(255,255,255,0.5)' }}>
                        Nu există date disponibile momentan.
                    </div>
                )}
            </div>
        </div>
    );

}