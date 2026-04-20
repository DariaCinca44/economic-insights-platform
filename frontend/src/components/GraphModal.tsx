import {useEffect, useState} from 'react';
import styles from './GraphModal.module.css';
import LineChartCard from './LineChartCard';

type DataPoint = {date: string; value: number};

type GraphData = {
    id: string;
    title?: string;
    points? : DataPoint[];
    lineColor?: string;
    yAxisLabel?: string;
}

interface GraphModalProps {
    graph: GraphData;
    onClose: () => void;
}

function TypingEffect({text} : {text: string}) {
    const [displayedText, setDisplayedText] = useState("");

    useEffect(() => {
        let i = 0;
        setDisplayedText("");

        const interval = setInterval(() => {
            setDisplayedText(text.slice(0, i));
            i += 4;
            if (i > text.length) {
                setDisplayedText(text);
                clearInterval(interval);
            }
        }, 15);
        return () => clearInterval(interval);
} , [text]);

    return <div style={{whiteSpace: 'pre-wrap', lineHeight: '1.6'}}>{displayedText}</div>;
}

export default function GraphModal({graph, onClose} : GraphModalProps) {
    const [aiInsights, setAiInsights] = useState("");
    const [isThinking, setIsThinking] = useState(true);


    useEffect(() => {
        document.body.style.overflow = 'hidden';
        let isMounted = true;

        async function fetchInsights() {
            try{
                const token = sessionStorage.getItem('token');
                const response = await fetch('/api/insights', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        ...(token && {'Authorization': `Bearer ${token}`})
                    },
                    body: JSON.stringify({
                        title: graph.title || 'Grafic',
                        points: graph.points || []
                    })

                });

                if (!response.ok) {
                    throw new Error('Failed to fetch insights');
                }

                const data = await response.json();
                const fullText = data.insight || data.insights || "Nu am putut genera insight-uri pentru acest grafic.";

                if(!isMounted) return;

                setAiInsights(fullText);
                setIsThinking(false);

            } catch (error) {
                if (isMounted){
                    setIsThinking(false);
                    setAiInsights("Ne pare rău, dar nu am putut genera insight-urile pentru acest grafic.");
                }
            }
        }

        if (graph.points && graph.points.length > 0) {
            fetchInsights();
        } else {
            setIsThinking(false);
            setAiInsights("Acest grafic nu conține date suficiente pentru a genera insight-uri relevante.");
        }

        return () => {
            document.body.style.overflow = 'unset';
            isMounted = false;
        }
    } , [graph]);

    return (
        <div className={styles.overlay} onClick = {onClose}>
            <div className = {styles.modalContainer} onClick={(e) => e.stopPropagation()} style = {{outline: 'none', WebkitTapHighlightColor: 'transparent'}}>
                <button className={styles.closeButton} onClick={onClose} style = {{outline: 'none'}}>X</button>

                <div className={styles.contentWrapper}>
                    <div className={styles.chartSection}>
                        <LineChartCard title= {graph.title || 'Grafic'} data={graph.points || []} height="100%" lineColor={graph.lineColor || "#8b5cf6"} yAxisLabel={graph.yAxisLabel || "Valoare"}/>
                    </div>

                    <div className={styles.aiSection}>
                        <h3>Analiza Generata de AI</h3>
                        <div className={styles.aiContent} style={{outline: 'none'}}>
                            {isThinking? (
                                <p className={styles.thinkingText}>Generare insight-uri pentru <strong>{graph.title}</strong>...</p>
                             ) : (
                                <TypingEffect text={aiInsights}/>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}