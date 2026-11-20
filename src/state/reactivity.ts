type EffectFn = (() => void) & {
  deps: Set<Set<EffectFn>>
  cleanup?: () => void
}

let activeEffect: EffectFn | null = null

// target -> key -> Set<EffectFn>
const targetMap = new WeakMap<object, Map<string | symbol, Set<EffectFn>>>()

// Кэш существующих прокси: rawTarget -> proxy
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const proxyMap = new WeakMap<object, any>()

// Очередь для пакетного выполнения эффектов (Batching)
const effectQueue = new Set<EffectFn>()
let isFlushing = false

function queueEffect(fn: EffectFn) {
  effectQueue.add(fn)
  if (!isFlushing) {
    isFlushing = true
    // Объединяем синхронные изменения в один микротик
    queueMicrotask(() => {
      try {
        effectQueue.forEach((e) => e())
      } finally {
        effectQueue.clear()
        isFlushing = false
      }
    })
  }
}

/**
 * Очистка старых зависимостей перед повторным запуском или уничтожением
 */
function cleanupEffect(effect: EffectFn) {
  for (const depSet of effect.deps) {
    depSet.delete(effect)
  }
  effect.deps.clear()
}

/**
 * Сбор зависимостей (вызывается в get-ловушке)
 */
function track(target: object, key: string | symbol) {
  if (!activeEffect) return

  let depsMap = targetMap.get(target)
  if (!depsMap) {
    depsMap = new Map()
    targetMap.set(target, depsMap)
  }

  let dep = depsMap.get(key)
  if (!dep) {
    dep = new Set()
    depsMap.set(key, dep)
  }

  dep.add(activeEffect)
  activeEffect.deps.add(dep)
}

/**
 * Оповещение зависимостей (вызывается в set-ловушке)
 */
function trigger(target: object, key: string | symbol) {
  const depsMap = targetMap.get(target)
  if (!depsMap) return

  const effectsToRun = new Set<EffectFn>()

  const addEffects = (effects?: Set<EffectFn>) => {
    if (effects) {
      effects.forEach((eff) => {
        // Защита от бесконечного цикла, если эффект мутирует то же свойство
        if (eff !== activeEffect) {
          effectsToRun.add(eff)
        }
      })
    }
  }

  // 1. Зависимости конкретного ключа
  addEffects(depsMap.get(key))

  // 2. Если меняется длина массива, триггерим подписчиков на итерации и length
  if (Array.isArray(target) && key === 'length') {
    depsMap.forEach((effects, prop) => {
      if (prop === 'length') addEffects(effects)
    })
  }

  effectsToRun.forEach(queueEffect)
}

/**
 * Рекурсивное создание глубокого реактивного объекта (Deep Reactive)
 */
export function reactive<T extends object>(target: T): T {
  if (target === null || typeof target !== 'object') {
    return target
  }

  // Возвращаем существующий прокси, если объект уже обернут
  const existingProxy = proxyMap.get(target)
  if (existingProxy) {
    return existingProxy
  }

  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      track(target, key)
      const res = Reflect.get(target, key, receiver)

      // Глубокая реактивность: оборачиваем вложенные объекты по мере обращения
      if (res !== null && typeof res === 'object') {
        return reactive(res)
      }

      return res
    },

    set(target, key, value, receiver) {
      const oldValue = Reflect.get(target, key, receiver)
      const hadKey =
        Array.isArray(target) && Number.isInteger(Number(key))
          ? Number(key) < target.length
          : Object.prototype.hasOwnProperty.call(target, key)

      // Защита от NaN !== NaN
      const isUnchanged = Object.is(oldValue, value)

      const result = Reflect.set(target, key, value, receiver)

      if (!result) return false

      // Триггерим эффект только если значение действительно изменилось
      if (!hadKey || !isUnchanged) {
        trigger(target, key)
      }

      return true
    },

    deleteProperty(target, key) {
      const hadKey = Object.prototype.hasOwnProperty.call(target, key)
      const result = Reflect.deleteProperty(target, key)

      if (hadKey && result) {
        trigger(target, key)
      }
      return result
    }
  })

  proxyMap.set(target, proxy)
  return proxy
}

/**
 * Запуск реактивного эффекта с возвратом функции отписки (cleanup)
 */
export function effect(fn: () => void): () => void {
  const effectFn: EffectFn = () => {
    try {
      cleanupEffect(effectFn)
      activeEffect = effectFn
      fn()
    } finally {
      activeEffect = null
    }
  }

  effectFn.deps = new Set()
  effectFn() // Первый синхронный запуск для фиксации зависимостей

  return () => {
    cleanupEffect(effectFn)
    effectQueue.delete(effectFn)
  }
}
