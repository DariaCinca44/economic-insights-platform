import { useState, useEffect } from "react";
import styles from "./AnimatedKPI.module.css";

interface KPIProps{
    title: string;
    value: number;
    suffix? : string;
    status: string;
    color? : string;
    isDecimal? : boolean;
}

export default function AnimatedKPI({title, value, suffix = "", status, color = "#10b981", isDecimal = false} : KPIProps) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start=0;
        const duration = 1200;
        const steps=40;
        const stepTime = Math.abs(Math.floor(duration/steps));
        const increment = value / steps;

        if (value === 0) return;

        const timer = setInterval(() => {
            start += increment;
            if (start >= value){
                setCount(value);
                clearInterval(timer);
            } else {
                setCount(start);
            }
         }, stepTime);

         return () => clearInterval(timer);
        }, [value]);

        return(
            <div className= {styles.kpiCard} style = {{ '--accent-color' : color} as any}>
                <div className={styles.kpiHeader}>
                    <span className = {styles.kpiTitle}>{title}</span>
                    <div className={styles.statusBadge} style ={{ backgroundColor: color}}>{status}</div>
                </div>
                <div className= {styles.kpiMain}>
                    <span className={styles.kpiValue}>
                        {isDecimal ? count.toFixed(1) : Math.floor(count)}
                        <small className={styles.suffix}>{suffix}</small>
                    </span>
                </div>
            </div>
        )
}