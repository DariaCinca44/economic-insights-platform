import * as Select from '@radix-ui/react-select'
import { Check, ChevronDown } from 'lucide-react'

export type Domain= 'food' | 'tech'

export default function DomainSelect({value, onChange, options}:{
    value:Domain;
    onChange: (v:Domain) => void;
    options: Array<{id: Domain; label: string}>;
}) {
    return (
        <Select.Root value={value} onValueChange={(v)=> onChange(v as Domain)}>
            <Select.Trigger className={[
                "inline-flex w-56 items-center justify-between gap-2",
                "rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-extrabold text-slate-900 shadow-sm",
                "outline-none focus:ring-2 focus:ring-violet-400/50",
                "dark:border-white/10 darl:bg-slate-900 dark:text-slate-50"
            ].join(" ")}
            aria-label='Domain'>
                <Select.Value />
                <Select.Icon className= "text-slate-500 dark:text-slate-300">
                    <ChevronDown size={18} />
                </Select.Icon>
            </Select.Trigger>

            <Select.Portal>
                <Select.Content position="popper" sideOffset={8} className={[
                    "z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg",
                    "dark:border-white/10 dark:bg-slate-900"
                ].join(" ")}>
                    <Select.Viewport className="p-2">
                        {options.map((o)=> (
                            <Select.Item key= {o.id} value={o.id} className={[
                                "relative flex cursor-pointer select-none items-center rounded-xl px-9 py-2 text-sm font-bold",
                                "text-slate-900 outlin-none",
                                "hover:bg-slate-100 data-[highlighted]:bg-slate-100",
                                "dark:text-slate-50 dark:hover:bg-white/10 dark:data-[highlighted]:bg-white/10"
                            ].join(" ")}>
                                <Select.ItemIndicator className="absolute left-23 inline-flex items-center">
                                    <Check size={16} className="text-violet-500"/>
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