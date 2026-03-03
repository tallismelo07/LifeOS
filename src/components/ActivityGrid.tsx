import { allDatesLastYear } from '../utils'

export function ActivityGrid({ activeDates }: { activeDates: Set<string> }) {
  const dates = allDatesLastYear()
  const weeks: string[][] = []
  let week: string[] = []

  dates.forEach((d, i) => {
    if (i === 0) {
      const day = new Date(d + 'T00:00:00').getDay()
      for (let p = 0; p < day; p++) week.push('')
    }
    week.push(d)
    if (week.length === 7) { weeks.push(week); week = [] }
  })
  if (week.length) weeks.push(week)

  return (
    <div className="flex gap-[3px] overflow-x-auto no-scrollbar pb-1">
      {weeks.map((w, wi) => (
        <div key={wi} className="flex flex-col gap-[3px]">
          {w.map((d, di) =>
            d ? (
              <div
                key={d}
                title={d}
                className={`w-[9px] h-[9px] rounded-[2px] transition-colors duration-150 ${
                  activeDates.has(d)
                    ? 'bg-[#111] dark:bg-[#F0F0F0]'
                    : 'bg-neutral-100 dark:bg-neutral-800'
                }`}
              />
            ) : (
              <div key={`e-${wi}-${di}`} className="w-[9px] h-[9px]" />
            )
          )}
        </div>
      ))}
    </div>
  )
}
