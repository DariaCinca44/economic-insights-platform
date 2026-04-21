import { useMemo } from 'react';
import styles from './CorrelationCard.module.css';
import { Search } from 'lucide-react';
import type { DataPoint } from '../api/dashboard';

interface Props {
    domainLabel: string;
    trendsData: DataPoint[];
    consumptionData: DataPoint[];
}

export default function CorrelationCard({ domainLabel, trendsData, consumptionData }: Props) {
    
    const correlationScore = useMemo(() => {
        if (!trendsData?.length || !consumptionData?.length) return 0;

        const trendsMap = new Map(trendsData.map(d => [d.date, d.value]));
        const x: number[] = [];
        const y: number[] = []; 

        consumptionData.forEach(d => {
            if (trendsMap.has(d.date)) {
                x.push(trendsMap.get(d.date)!);
                y.push(d.value);
            }
        });

        if (x.length === 0) return 0;

        const n = x.length;
        const sumX = x.reduce((a, b) => a + b, 0);
        const sumY = y.reduce((a, b) => a + b, 0);
        const sumX2 = x.reduce((a, b) => a + b * b, 0);
        const sumY2 = y.reduce((a, b) => a + b * b, 0);
        const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);

        const numerator = (n * sumXY) - (sumX * sumY);
        const denominator = Math.sqrt(((n * sumX2) - (sumX * sumX)) * ((n * sumY2) - (sumY * sumY)));

        if (denominator === 0) return 0;
        
        return Math.round((numerator / denominator) * 100);
    }, [trendsData, consumptionData]);

    const absScore = Math.abs(correlationScore);
    let statusClass = styles.statusLow;
    let message = "";
    
   if (absScore >= 50) {
        statusClass = styles.statusHigh;
        const tipCorelatie = correlationScore > 0 ? "pozitivă (cresc împreună)" : "negativă/inversă (una crește, alta scade)";
        message = `Corelație puternic ${tipCorelatie}. Acest lucru demonstrează că volumul căutărilor pe Google dictează direct evoluția vânzărilor fizice în sectorul "${domainLabel}".`;
    } else if (absScore >= 25) {
        statusClass = styles.statusMedium;
        const tipCorelatie = correlationScore > 0 ? "pozitivă" : "negativă";
        message = `Corelație moderată (${tipCorelatie}). Interesul online influențează sectorul "${domainLabel}", dar există și alți factori (ex: sezonalitate, inflație) care dictează decizia de cumpărare.`;
    } else {
        statusClass = styles.statusLow;
        message = `Corelație slabă sau inexistentă. Pentru sectorul "${domainLabel}", trendurile de căutare pe internet nu sunt un predictor direct pentru volumul real al vânzărilor din piață. Oamenii consumă aceste bunuri indiferent de interesul online (bunuri inelastice).`;
    }

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <Search size={22} color="#8b5cf6" />
                <span>Analiza de Predictibilitate (Google Trends vs. Vânzări)</span>
            </div>
            
            <div className={styles.scoreContainer}>
                <span className={styles.score} style={{ color: absScore >= 50 ? '#16a34a' : absScore >= 25 ? '#eab308' : '#dc2626' }}>
                    {correlationScore > 0 ? `+${correlationScore}` : correlationScore}%
                </span>
            </div>

            <div className={`${styles.description} ${statusClass}`}>
                {message}
            </div>
        </div>
    );
}