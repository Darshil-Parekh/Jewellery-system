import { useCallback, useEffect, useState } from 'react'
import { api, getErrorMessage } from '../services/api'

export function useApiData(path) {
  const [result, setResult] = useState({ key: '', data: null, error: '' })
  const [refreshIndex, setRefreshIndex] = useState(0)
  const requestKey = `${path}:${refreshIndex}`

  const reload = useCallback(() => {
    setRefreshIndex((index) => index + 1)
  }, [])

  useEffect(() => {
    let active = true

    api
      .get(path)
      .then((response) => {
        if (active) setResult({ key: requestKey, data: response.data, error: '' })
      })
      .catch((requestError) => {
        if (active) setResult({ key: requestKey, data: null, error: getErrorMessage(requestError) })
      })

    return () => {
      active = false
    }
  }, [path, requestKey])

  return {
    data: result.key === requestKey ? result.data : null,
    loading: result.key !== requestKey,
    error: result.key === requestKey ? result.error : '',
    reload,
  }
}
