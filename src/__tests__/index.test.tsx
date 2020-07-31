import React, {useState} from "react";
import render, { act } from 'hooks-test-util'
import usePromiseCall from '../index'

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

function flushTimeout(time = 100) {
  return new Promise(resolve => setTimeout(resolve, time));
}

describe("usePromiseCall test",() => {

  it('should update loading status when component mount', async () => {
    const query = jest.fn().mockResolvedValue(null)
    const { container } = render(() => {
      return usePromiseCall(
        query,
        ['id']
      )
    })
    expect(container.hook.loading).toBe(true)
    await act(async () => {
      await flushPromises();
    })
    expect(query).toBeCalledWith('id');
    expect(container.hook.loading).toBe(false)
  })

  it('should use initial value as initial data', async () => {
    const query = jest.fn().mockResolvedValue(null)
    const initial = 'initial'
    const { container } = render(() => {
      return usePromiseCall(
        query, [], {
          initial
        }
      )
    })
    expect(container.hook.data).toBe(initial)
  })

  it('should set data when promise success', async () => {
    const result = {
      data: 'data'
    }
    const query = jest.fn().mockResolvedValue(result)
    const { container } = render(() => {
      return usePromiseCall(
        query,
        ['id']
      )
    })
    await act(async () => {
      await flushPromises();
    })
    expect(container.hook.data).toBe(result)
    expect(container.hook.error).toBe(null)
  })
  it('should set error when promise fail', async () => {
    const error = {
      errorCode: '00100'
    }
    const query = jest.fn().mockRejectedValue(error)
    const { container } = render(() => {
      return usePromiseCall(
        query,
        ['id']
      )
    })
    await act(async () => {
      await flushPromises();
    })
    expect(container.hook.data).toBe(null)
    expect(container.hook.error).toBe(error)
  })
  it('should set loading when excute reload method', async () => {
    const query = jest.fn().mockResolvedValue(null)
    const { container } = render(() => {
      return usePromiseCall(
        query,
        ['id']
      )
    })
    await act(async () => {
      await flushPromises();
    })
    expect(container.hook.loading).toBe(false)
    act(() => {
      container.hook.reload()
    })
    expect(container.hook.loading).toBe(true)
    await act(async () => {
      await flushPromises();
    })
  })
  it('should use new params to query method', async () => {
    const query = jest.fn().mockResolvedValue(null)
    const { container } = render(() => {
      return usePromiseCall(
        query,
        ['id']
      )
    })
    await act(async () => {
      await flushPromises();
    })
    act(() => {
      container.hook.reload('id2')
    })
    expect(query).toHaveBeenNthCalledWith(2, 'id2');
    await act(async () => {
      await flushPromises();
    })
  })
  it('should use function result when requestQuery parameter is function', async () => {
    const query = jest.fn().mockResolvedValue(null)
    const parameter = 'id';
    const parameterFn = jest.fn().mockReturnValue(parameter)
    const { container } = render(() => {
      return usePromiseCall(
        query,
        parameterFn
      )
    })
    expect(parameterFn).toHaveBeenCalled()
    await act(async () => {
      await flushPromises();
    })
    expect(query).toBeCalledWith(parameter);
  })
  it('should support dependent promise', async () => {
    const product = {
      id: 1,
      name: 'product name'
    }
    const query1 = jest.fn().mockResolvedValue(product)
    const query2 = jest.fn().mockResolvedValue(null)
    render(() => {
      const {data} = usePromiseCall(
        query1,
        'id'
      )
      usePromiseCall(
        query2,
        () => data.id
      )
    })
    await act(async () => {
      await flushTimeout(100);
    })
    expect(query1).toBeCalledWith('id');
    expect(query2).toBeCalledWith(product.id);
  })
  it('should run async method when dependency parameters is change', async () => {
    const getProducts = jest.fn().mockResolvedValue(null)
    const productId = 'id';
    const { container } = render(() => {
      const [query, setQuery] = useState('')
      const call = usePromiseCall(
        getProducts,
        [productId, query]
      )
      return {
        call,
        setQuery
      }
    })
    expect(getProducts).toBeCalledWith(productId, "");
    await act(async () => {
      await flushPromises();
    })
    act(() => {
      container.hook.setQuery('name')
    })
    expect(getProducts).toHaveBeenCalledTimes(2);
    expect(getProducts).toHaveBeenNthCalledWith(2, productId, "name");
    await act(async () => {
      await flushPromises();
    })
  })
  it('should set loading when excute reload method', async () => {
    const query = jest.fn().mockResolvedValue(null)
    const { container } = render(() => {
      return usePromiseCall(
        query,
        [],
        { manual:true }
      )
    })
    expect(query).not.toHaveBeenCalled();
    await act(async () => {
      await flushPromises();
    })
    act(() => {
      container.hook.run('id')
    })
    expect(container.hook.loading).toBeTruthy();
    await act(async () => {
      await flushPromises();
    })
    expect(container.hook.loading).toBeFalsy();
  })
  it('should handle promise race', async () => {
    let called = false;
    let count = 0;
    const query = jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(++count)
        }, called ? 100 : 200)
      })
    })
    const { container } = render(() => {
      return usePromiseCall(
        query,
        [],
        { manual:true }
      )
    })
    act(() => {
      container.hook.run()
      container.hook.run()
    })
    await act(async () => {
      await flushTimeout(100);
    })
    expect(container.hook.data).toEqual(null);
    expect(container.hook.loading).toBeTruthy();
    await act(async () => {
      await flushTimeout(100);
    })
    expect(container.hook.data).toEqual(2);
    expect(container.hook.loading).toBeFalsy();
  })
})
