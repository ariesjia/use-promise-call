import {useCallback, useEffect, useRef, useState} from 'react';

const errorSymbol = Symbol()

export interface usePromiseCallOptions<T> {
  interval?: number
  initial?: Partial<T>
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
  const { interval = 100, initial } = options
  const didCancel = useRef(false);
  const initialValue: State<T, K> = {
    data:  initial ? initial : null,
    error: null,
    loading: false,
  };
  const stateRef = useRef<State<T, K>>(initialValue);
  const rerender = useState<{}>({})[1];
  const dispatch = useCallback(
    payload => {
      const keys = Object.keys(payload);
      const shouldUpdateState = !!keys.length
      keys.forEach(key => {
        stateRef.current[key] = payload[key];
      });
      if (shouldUpdateState) {
        rerender({});
      }
    },
    [rerender],
  );
  const paramsRef = useRef();
  const load = (requestParams: any) => {
    const params = getParamArray(requestParams);
    dispatch({
      loading: true,
    });
    const promise = asyncMethod(...params);
    promise.then(
      res => {
        if (!didCancel.current) {
          dispatch({
            data: res,
            loading: false,
          });
        }
      },
      err => {
        if (!didCancel.current) {
          dispatch({
            error: err,
            loading: false,
          });
        }
      },
    );
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
    revalidate();
  }, getParamArray(params));

  useEffect(() => {
    return () => {
      didCancel.current = true;
    };
  }, []);

  return {
    get data() : typeof initialValue['data'] {
      return stateRef.current.data;
    },
    get loading() : typeof initialValue['loading'] {
      return stateRef.current.loading;
    },
    get error() : typeof initialValue['error'] {
      return stateRef.current.error;
    },
    reload: (reloadQuery: any = paramsRef.current) => load(reloadQuery),
  };
};

export default usePromiseCall;
