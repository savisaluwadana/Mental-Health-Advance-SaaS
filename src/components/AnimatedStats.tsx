'use client'

import { useEffect, useMemo, useState } from 'react'

type Stat = {
  label: string
  value: number
  suffix?: string
  icon: React.ReactNode
}

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    let start: number | null = null
    let rafId: number

    const step = (timestamp: number) => {
      if (start === null) start = timestamp
      const progress = Math.min((timestamp - start) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) rafId = requestAnimationFrame(step)
    }

    rafId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(rafId)
  }, [target, duration])

  return value
}

export function AnimatedStats() {
  const stats: Stat[] = useMemo(
    () => [
      {
        label: 'Licensed Practitioners',
        value: 50,
        suffix: '+',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 11c2.761 0 5-2.239 5-5S14.761 1 12 1 7 3.239 7 6s2.239 5 5 5zm0 2c-3.866 0-7 2.239-7 5v3h14v-3c0-2.761-3.134-5-7-5z" />
          </svg>
        ),
      },
      {
        label: 'Minds Bridged',
        value: 5000,
        suffix: '+',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M7 11c1.657 0 3-1.343 3-3S8.657 5 7 5 4 6.343 4 8s1.343 3 3 3zm10 0c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM2 20v-1c0-2.761 2.239-5 5-5h0c2.761 0 5 2.239 5 5v1M12 20v-1c0-2.761 2.239-5 5-5h0c2.761 0 5 2.239 5 5v1" />
          </svg>
        ),
      },
      {
        label: 'Mind Support',
        value: 24,
        suffix: '/7',
        icon: (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75}
              d="M12 6V3m0 0a9 9 0 110 18 9 9 0 010-18zm0 6h4" />
          </svg>
        ),
      },
    ],
    []
  )

  return (
    <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm text-muted-foreground">
      {stats.map((stat) => (
        <StatItem key={stat.label} stat={stat} />
      ))}
    </div>
  )
}

function StatItem({ stat }: { stat: Stat }) {
  const count = useCountUp(stat.value)

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
        {stat.icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground">
          {count.toLocaleString()}{stat.suffix}
        </p>
        <p>{stat.label}</p>
      </div>
    </div>
  )
}
