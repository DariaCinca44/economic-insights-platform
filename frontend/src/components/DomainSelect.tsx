import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'
import type {Domain} from '../config/domains'
import styles from './DomainSelect.module.css'

export default function DomainSelect({value, onChange, options}:{
    value:Domain;
    onChange: (v:Domain) => void;
    options: Array<{id: Domain; label: string}>;
}) {
    return (
        <Select.Root value={value} onValueChange={(v) => onChange(v as Domain)}>
            <Select.Trigger className={styles.trigger} aria-label='Domain'>
                <Select.Value/>
                <Select.Icon className={styles.icon}>
                    <ChevronDown size={18}/>
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content position='popper' sideOffset={8} className={styles.content}>
                    <Select.Viewport className={styles.viewport}>
                        {options.map((o)=>(
                            <Select.Item key={o.id} value={o.id} className={styles.item}>
                                <Select.ItemIndicator className={styles.itemIndicator}>
                                    <Check size={16} className={styles.checkIcon}/>
                                </Select.ItemIndicator>
                                <Select.ItemText>{o.label}</Select.ItemText>
                            </Select.Item>
                        ))}
                    </Select.Viewport>
                </Select.Content>
            </Select.Portal>
        </Select.Root>
    )
}