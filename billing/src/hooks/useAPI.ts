import { getPreferenceValues, List } from "@raycast/api";
import { fetch } from 'cross-fetch'
import useSWRInfinite, { SWRInfiniteMutatorOptions } from 'swr/infinite'
import { API, SearchParams } from "../shared/types";
import { useEffect, useMemo } from "react";
import { isSome } from "../shared/utils";
import useSWR, { MutatorCallback } from "swr";
import { useCachedState } from "@raycast/utils";

interface PreferenceValues {
  TOKEN: string;
}

type PaginationOptions = Readonly<Partial<{
  params: SearchParams | null
  size: number
}>>

type Options = Readonly<Partial<{
  params: SearchParams | null
}>>

export type FixedSWRInfiniteKeyedMutator<Data> = <MutationData = Data>(data?: MutationData | Promise<MutationData | undefined> | MutatorCallback<Data>, opts?: boolean | SWRInfiniteMutatorOptions<Data, MutationData>) => Promise<MutationData | undefined>;

type Return<T> = Readonly<{
  data: ReadonlyArray<T> | undefined
  mutate: FixedSWRInfiniteKeyedMutator<Array<API<Array<T>>>>
  pagination: Exclude<List.Props['pagination'], undefined>
  isLoading: boolean
}>

function toURLSearchParams(params: SearchParams): URLSearchParams {
  const search = new URLSearchParams()

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const v of value) {
        if (isSome(v)) search.append(key, v.toString())
      }
    } else {
      if (isSome(value)) search.set(key, value.toString())
    }
  }

  return search

}

export function update<T>(data: Array<API<Array<T>>> | undefined, where: (item: Readonly<T>) => boolean, updater: (item: Readonly<T>) => T | Array<T>): Array<API<Array<T>>> {
  let inserted = false

  return (data ?? []).map(page => {
    if (page.succeeded) {
      return {
        ...page, data: page.data.flatMap(item => {
          if (where(item) && !inserted) {
            const result = updater(item)
            inserted = true
            return Array.isArray(result) ? result : [result]
          } else {
            return [item]
          }
        })
      }
    } else {
      return { ...page }
    }
  })
}

export async function api<T>(endpoint: string, init?: Parameters<typeof fetch>[1]): Promise<T> {
  const resp: API<T> = await fetch(`https://api.equt.services${endpoint}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getPreferenceValues<PreferenceValues>().TOKEN}`,
      ...init?.headers,
    },
  }).then(r => r.json())

  if (!resp.succeeded) {
    throw new Error(resp.message)
  }

  return resp.data
}

export function useAPI<T>(endpoint: string, options?: Options) {
  const {
    params = {},
  } = options ?? {}

  const { data, mutate, isLoading, isValidating } = useSWR<T>(params === null ? null : `https://api.equt.services${endpoint}?` + toURLSearchParams(params).toString(), (url: string) => fetch(url, {
    headers: {
      Authorization: `Bearer ${getPreferenceValues<PreferenceValues>().TOKEN}`,
    },
  }).then((r): Promise<API<T>> => r.json()).then(resp => {
    if (resp.succeeded) {
      return resp.data
    } else {
      throw new Error(resp.message)
    }
  }))

  return {
    data,
    mutate,
    isLoading: useMemo(() => isLoading || isValidating, [isLoading, isValidating])
  }
}

export function usePaginationAPI<T>(endpoint: string, options?: PaginationOptions): Return<T> {
  const {
    size = 10,
    params = {},
  } = options ?? {}

  const {
    data,
    isLoading,
    isValidating,
    mutate,
    setSize,
  } = useSWRInfinite<API<Array<T>>>((_, previous) => {
    if (previous && !previous.succeeded) return null
    if (previous && previous.cursor === undefined) return null
    if (params === null) return null

    const search = toURLSearchParams(params)
    search.set('size', size.toString())
    if (previous && previous.cursor) search.set('cursor', previous.cursor)

    return endpoint + '?' + search.toString()
  }, async path => {
    console.log(path)
    return await fetch(`https://api.equt.services${path}`, {
      headers: {
        Authorization: `Bearer ${getPreferenceValues<PreferenceValues>().TOKEN}`,
      }
    }).then(r => r.json())
  },
    {
      use: [
        useSWR => (key, fetcher, config) => {
          const swr = useSWR(key, fetcher, config)

          const [data, setData] = useCachedState((key as () => string)(), swr.data)

          useEffect(() => {
            if (swr.data !== undefined) {
              setData(swr.data)
            }
          }, [swr.data])

          return Object.assign({}, swr, {
            data,
          })
        },
      ],
    }
  )

  return {
    data: useMemo(() => data?.flatMap(d => d.succeeded ? d.data : []), [data]),
    mutate: mutate as FixedSWRInfiniteKeyedMutator<Array<API<Array<T>>>>,
    pagination: useMemo(() => {
      const last = data?.[data.length - 1]

      return {
        hasMore: (last?.succeeded && last.cursor !== undefined) ?? false,
        pageSize: size,
        onLoadMore() {
          setSize(size => size + 1)
        }
      }
    }, [data, size]),
    isLoading: useMemo(() => isLoading || isValidating, [isLoading, isValidating])
  }
}