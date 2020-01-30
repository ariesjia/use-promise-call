import React from "react";
import render, { act } from 'hooks-test-util'
import usePromiseCall from '../index'

function flushPromises() {
  return new Promise(resolve => setImmediate(resolve));
}

describe("usePromiseCall test",() => {
  it('should update loading status when component mount', async () => {
    const query = jest.fn().mockImplementation(() => Promise.resolve())
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
  it('should set data when promise success', async () => {
    const result = {
      data: 'data'
    }
    const query = jest.fn().mockImplementation(() => Promise.resolve(result))
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
    const result = {
      errorCode: '00100'
    }
    const query = jest.fn().mockImplementation(() => Promise.reject(result))
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
    expect(container.hook.error).toBe(result)
  })
  it('should set loading and trigger promise when excute reload method', async () => {
    const result = {
      errorCode: '00100'
    }
    const query = jest.fn().mockImplementation(() => Promise.resolve(result))
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
    expect(query).toBeCalledTimes(2);
  })
})
