import { useState } from 'react'
import { useBiomeStore, type DetectResult } from '../stores/biomeStore'

/** Detecting the home Biome from location, with its in-progress flag and last result. */
export function useDetectHome() {
  const detectHome = useBiomeStore((s) => s.detectHome)
  const [detecting, setDetecting] = useState(false)
  const [result, setResult] = useState<DetectResult | null>(null)

  async function detect() {
    setDetecting(true)
    setResult(await detectHome())
    setDetecting(false)
  }

  return { detecting, result, detect, clearResult: () => setResult(null) }
}
