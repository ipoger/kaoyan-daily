export const STORAGE_KEY = 'kaoyan-daily/v1'
export const STATE_VERSION = 1

export const DEFAULT_SETTINGS = {
  examDate: '2026-12-19',
  theme: 'auto',
  daily: { math: 1, english: 1, cs408: 2, politics: 0 },
  reviewLimit: 4,
}

export function createDefaultState() {
  return {
    version: STATE_VERSION,
    createdAt: new Date().toISOString(),
    settings: structuredClone(DEFAULT_SETTINGS),
    days: {},
    progress: {},
    customQuestions: [],
    meta: {},
  }
}

/** 兼容旧数据 / 部分损坏的备份，保证 UI 不会因为缺字段崩掉。 */
export function normalizeState(raw) {
  if (!raw || typeof raw !== 'object') return createDefaultState()
  const base = createDefaultState()
  const state = {
    ...base,
    ...raw,
    settings: {
      ...base.settings,
      ...(raw.settings || {}),
      daily: { ...base.settings.daily, ...(raw.settings?.daily || {}) },
    },
    days: raw.days && typeof raw.days === 'object' ? raw.days : {},
    progress: raw.progress && typeof raw.progress === 'object' ? raw.progress : {},
    customQuestions: Array.isArray(raw.customQuestions) ? raw.customQuestions : [],
    meta: raw.meta && typeof raw.meta === 'object' ? raw.meta : {},
  }
  state.version = STATE_VERSION
  return state
}

export function loadState(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(STORAGE_KEY)
    if (!raw) return createDefaultState()
    return normalizeState(JSON.parse(raw))
  } catch (error) {
    console.warn('读取本地进度失败，已使用空白进度。', error)
    return createDefaultState()
  }
}

export function saveState(state, storage = globalThis.localStorage) {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(state))
    return true
  } catch (error) {
    console.warn('保存进度失败。', error)
    return false
  }
}

export function clearState(storage = globalThis.localStorage) {
  try {
    storage?.removeItem(STORAGE_KEY)
  } catch (error) {
    console.warn('清除进度失败。', error)
  }
}
