import type { ComponentType, SVGProps } from 'react'
import { IconLock } from '@/components/icons'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number }>

interface Props {
  icon: IconType
  color: string
  colorDark: string
  earned: boolean
  size?: number
}

/** Gerçek bir madalya/rozet görünümü — gradient dolgu + parlak halka + kilit durumu.
 *  Harici görsel dosyası gerektirmeden (SVG ikon + CSS gradient) tutarlı bir rozet kimliği verir. */
export default function BadgeMedal({ icon: Icon, color, colorDark, earned, size = 52 }: Props) {
  return (
    <div
      className="relative shrink-0 rounded-full flex items-center justify-center"
      style={{
        width: size,
        height: size,
        background: earned
          ? `radial-gradient(circle at 35% 30%, ${color}, ${colorDark} 75%)`
          : 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.14), rgba(255,255,255,0.04) 75%)',
        boxShadow: earned
          ? `0 0 0 2px ${colorDark}55, 0 2px 8px ${colorDark}66, inset 0 1px 2px rgba(255,255,255,0.4)`
          : '0 0 0 1px rgba(255,255,255,0.08), inset 0 1px 2px rgba(255,255,255,0.05)',
      }}
    >
      <Icon
        size={Math.round(size * 0.46)}
        strokeWidth={1.6}
        className={earned ? 'text-white drop-shadow-sm' : ''}
        style={!earned ? { color: 'rgba(255,255,255,0.25)' } : undefined}
      />
      {!earned && (
        <div
          className="absolute -bottom-0.5 -right-0.5 h-5 w-5 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(11,15,25,0.95)', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          <IconLock size={10} style={{ color: 'rgba(255,255,255,0.45)' }} />
        </div>
      )}
    </div>
  )
}
