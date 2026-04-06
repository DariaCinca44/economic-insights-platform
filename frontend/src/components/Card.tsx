import styles from './Card.module.css'

export default function Card({title, right, children, className=""}: { 
    title?: string; 
    right?: React.ReactNode; 
    children: React.ReactNode; 
    className? : string}) {
        return (
            <div className={`${styles.card} ${className}`}>
                {(title || right) && (
                    <div className={styles.header}>
                        {title ? <div className={styles.title}>{title}</div> : <div/>}
                        {right}
                    </div>
                )}
                <div className={styles.content}> {children} </div>
            </div>
        )
    }