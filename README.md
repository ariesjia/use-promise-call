# use-promise-call
a React hook for state around promise

[![Actions Status](https://github.com/ariesjia/use-promise-call/workflows/Node%20CI/badge.svg)](https://github.com/ariesjia/use-promise-call/actions)
[![NPM](https://img.shields.io/npm/v/use-promise-call.svg)](https://www.npmjs.com/package/use-promise-call)
[![minified](https://badgen.net/bundlephobia/minzip/use-promise-call)](https://bundlephobia.com/result?p=use-promise-call)
[![license](https://badgen.net/badge/license/MIT/blue)](https://github.com/ariesjia/use-promise-call/blob/master/LICENSE)
[![codecov](https://codecov.io/gh/ariesjia/use-promise-call/branch/master/graph/badge.svg)](https://codecov.io/gh/ariesjia/use-promise-call)


## Install
```bash
// use yarn
yarn add use-promise-call
// use npm
npm install use-promise-call
```

## API

### usePromiseCall
* `usePromiseCall(asyncMethod, parameters, options?) => { data, error, loading, reload }`: usePromiseCall hooks to manage async status inside

  * `asyncMethod`: The method to run async  
     
  * `parameters`: The initial parameters to asyncMethod, or function to get initial parameters
     
  * `options`: config
    
    * `manual`: 
    
       default: false
       
    *  `initial`：
    
        default: null
        
    default : `{ interval = 100 }`
     
### result
* `data`: promise resolve value
* `error`: promise reject value
* `loading`: status of async method  
* `reload(parameters?)`: method of re-run async method

## Demo

### Base
```jsx harmony
const productId = '1'
const {data: product } = usePromiseCall(loadProduct, productId)
return product && <div>{product.name}</div>
```

### Parallel
```jsx harmony
const productId = '1'
const {data: product } = usePromiseCall(loadProduct, productId)
const {data: comments } = usePromiseCall(loadProductComments, productId)
return product && <div>{product.name}</div>
```

### Dependent
```jsx harmony
const productId = '1'
const {data: product, loading: productLoading} = usePromiseCall(loadProduct, productId)
const {data: store, loading: storeLoading} = usePromiseCall(loadStore, () => product.store.id)
return product && <div>{product.name}</div>
```