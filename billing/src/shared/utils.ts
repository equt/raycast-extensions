import { formatDate, isToday, isYesterday } from "date-fns"
import { NonEmptyArray, Nullable } from "./types"
import { showToast, Toast } from "@raycast/api"
import { pattern } from "@equt/pattern"

export function isNone<T>(value: T | undefined | null): value is undefined | null {
  return value === undefined || value === null
}

export function isSome<T>(value: T | undefined | null): value is T {
  return !isNone(value)
}

export async function toast<T>(verb: string, subject: string, promise: Promise<T>): Promise<T | undefined> {
  const toast = await showToast({
    title: `${verb.slice(0, 1).toUpperCase()}${verb.slice(1)}ing ${subject} ...`,
    style: Toast.Style.Animated,
  })
  try {
    const resolved = await promise
    toast.style = Toast.Style.Success
    toast.title = `Successfully ${verb.slice(0, 1).toUpperCase()}${verb.slice(1)}ed ${subject}`
    return resolved
  } catch (error) {
    toast.style = Toast.Style.Failure
    toast.title = `${verb.slice(0, 1).toUpperCase()}${verb.slice(1)}ed ${subject} Failed`
    toast.message = (error as Error).message
  }
}

export function renderDate<R extends Readonly<{ time: string | Date }>>({ time }: R): string {
  const date = new Date(time)
  if (isToday(date)) return 'Today'
  if (isYesterday(date)) return 'Yesterday'
  return formatDate(date, 'LLL do, yyyy')
}

export function group<R, K extends PropertyKey>(rows: ReadonlyArray<R>, by: (row: R) => K) {
  return rows.reduce<Record<K, NonEmptyArray<R>>>((groups, row) => {
    const key = by(row)
    if (!groups[key]) {
      groups[key] = [row]
    } else {
      groups[key].push(row)
    }
    return groups
  }, Object.create(null))
}

export function date<R extends Readonly<{ time: string | Date }>>(row: R): string {
  return formatDate(row.time, 'yyyy-MM-dd')
}

export const parseQuantity = pattern`×\s+${['quantity', /\d+/, {
  parse(input) {
    const int = parseInt(input)
    if (isNaN(int)) {
      throw new Error('Invalid Quantity')
    }
    return int
  }
}]}\s*$`

export function hasUnitPrice<T extends Readonly<{ name: Nullable<string> }>>(row: T): boolean {
  try {
    return isSome(row.name) && parseQuantity(row.name).quantity > 0
  } catch {
    return false
  }
}