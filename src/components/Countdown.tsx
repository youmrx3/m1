import { useEffect, useMemo, useState } from 'react'

type CountdownProps = {
  deadline: string
}

type CountdownState = {
  days: string
  hours: string
  minutes: string
  seconds: string
  expired: boolean
}

const formatPart = (value: number) => String(value).padStart(2, '0')

const computeCountdown = (deadline: string): CountdownState => {
  const target = new Date(deadline).getTime()

  if (Number.isNaN(target)) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      expired: false,
    }
  }

  const difference = target - Date.now()

  if (difference <= 0) {
    return {
      days: '00',
      hours: '00',
      minutes: '00',
      seconds: '00',
      expired: true,
    }
  }

  const totalSeconds = Math.floor(difference / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return {
    days: formatPart(days),
    hours: formatPart(hours),
    minutes: formatPart(minutes),
    seconds: formatPart(seconds),
    expired: false,
  }
}

function Countdown({ deadline }: CountdownProps) {
  const [, setTick] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTick((value) => value + 1)
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [deadline])

  const remaining = computeCountdown(deadline)

  const deadlineText = useMemo(
    () => new Date(deadline).toLocaleString('fr-FR', { dateStyle: 'full', timeStyle: 'short' }),
    [deadline],
  )

  return (
    <section className="countdown-panel" aria-live="polite">
      <p className="countdown-label">Date limite</p>
      <p className="countdown-deadline">{deadlineText}</p>

      {remaining.expired ? (
        <p className="countdown-ended">Le delai est termine.</p>
      ) : (
        <div className="countdown-grid">
          <article>
            <strong>{remaining.days}</strong>
            <span>Jours</span>
          </article>
          <article>
            <strong>{remaining.hours}</strong>
            <span>Heures</span>
          </article>
          <article>
            <strong>{remaining.minutes}</strong>
            <span>Minutes</span>
          </article>
          <article>
            <strong>{remaining.seconds}</strong>
            <span>Secondes</span>
          </article>
        </div>
      )}
    </section>
  )
}

export default Countdown
