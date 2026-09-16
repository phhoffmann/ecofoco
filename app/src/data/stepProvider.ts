import { Health } from '@capgo/capacitor-health'

function startOfTodayIso(): string {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d.toISOString()
}

export async function isHealthAvailable(): Promise<boolean> {
  const { available } = await Health.isAvailable()
  return available
}

export async function isStepsAuthorized(): Promise<boolean> {
  const status = await Health.checkAuthorization({ read: ['steps'] })
  return status.readAuthorized.includes('steps')
}

export async function requestStepsAuthorization(): Promise<boolean> {
  const status = await Health.requestAuthorization({ read: ['steps'] })
  return status.readAuthorized.includes('steps')
}

// Dev-only helper to write fake step data into Health Connect for testing, since
// walking 6,000 real steps on every test cycle isn't practical. Remove once the
// Activity flow is validated on-device.
export async function writeTestSteps(count: number): Promise<void> {
  await Health.requestAuthorization({ read: ['steps'], write: ['steps'] })
  const endDate = new Date()
  const startDate = new Date(endDate.getTime() - 60 * 60 * 1000)
  await Health.saveSample({
    dataType: 'steps',
    value: count,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  })
}

export async function getTodaySteps(): Promise<number> {
  const { samples } = await Health.queryAggregated({
    dataType: 'steps',
    startDate: startOfTodayIso(),
    endDate: new Date().toISOString(),
    bucket: 'day',
    aggregation: 'sum',
  })
  return samples.reduce((total, sample) => total + sample.value, 0)
}
