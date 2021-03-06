import {useCallback, useEffect, useRef, useState} from 'react';

const errorSymbol = Symbol()

export interface usePromiseCallOptions<T> {
  interval?: number
  initial?: Partial<T>
  manual?: boolean
}

function getParamArray(params: any) {
  return Array.isArray(params) ? params : [params];
}

interface State<T, K>  {
  loading: boolean;
  data: T | Partial<T> | null;
  error: K | null;
}

const usePromiseCall = <T = any, K = any>(
  asyncMethod: (...args: any[]) => Promise<any>,
  parameters?: any,
  options: usePromiseCallOptions<T> = {}
) => {
  const { interval = 100, initial = null, manual } = options
  const didCancel = useRef(false);
  const lastCall = useRef<number>(0);
  const initialValue: State<T, K> = {
    data: initial,
    error: null,
    loading: false,
  };
  const stateRef = useRef<State<T, K>>(initialValue);
  const rerender = useState<{}>({})[1];
  const dispatch = useCallback(
    payload => {
      const keys = Object.keys(payload);
      const shouldUpdateState = !!keys.length
      Object.assign(stateRef.current, payload)
      if (shouldUpdateState && !didCancel.current) {
        rerender({});
      }
    },
    [rerender],
  );
  const paramsRef = useRef();
  const load = (requestParams: any) => {
    lastCall.current += 1;
    const callNumber = lastCall.current;
    const params = getParamArray(requestParams);
    dispatch({
      error: null,
      loading: true,
    });
    const promise = asyncMethod(...params);
    promise.then(
      res => {
        if(callNumber === lastCall.current) {
          dispatch({
            data: res,
            loading: false,
          });
        }
      },
      err => {
        if(callNumber === lastCall.current) {
          dispatch({
            error: err,
            loading: false,
          });
        }
      },
    );
    return promise
  };
  let params;
  if (typeof parameters === 'function') {
    try {
      params = parameters();
    } catch (err) {
      params = errorSymbol;
    }
  } else {
    params = parameters;
  }

  paramsRef.current = params;

  const revalidate = () => {
    if (paramsRef.current !== errorSymbol) {
      load(paramsRef.current);
    } else {
      setTimeout(() => {
        revalidate();
      }, interval);
    }
  };

  useEffect(() => {
    if(!manual) {
      revalidate();
    }
  }, getParamArray(params));

  useEffect(() => {
    return () => {
      didCancel.current = true;
    };
  }, []);

  return {
    get data(): typeof stateRef.current.data {
      return stateRef.current.data;
    },
    get loading() : typeof initialValue['loading'] {
      return stateRef.current.loading;
    },
    get error() : typeof initialValue['error'] {
      return stateRef.current.error;
    },
    reload: (reloadQuery: any = paramsRef.current) => load(reloadQuery),
    run: (runQuery: any = paramsRef.current) => {
      if(manual) {
        return load(runQuery)
      } else {
        return Promise.reject("use-promise-call: run method should set manual to true")
      }
    },
  };
};

export default usePromiseCall;
