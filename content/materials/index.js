import math from './math.js'
import english from './english.js'
import cs408 from './cs408.js'
import politics from './politics.js'

export const materials = [...math, ...english, ...cs408, ...politics].sort(
  (a, b) => a.subject.localeCompare(b.subject) || a.order - b.order,
)

export function materialsForSubject(subject) {
  return materials.filter((material) => material.subject === subject).sort((a, b) => a.order - b.order)
}

export function findMaterial(subject, id) {
  return materialsForSubject(subject).find((material) => material.id === id) || null
}

export function materialNeighbors(subject, id) {
  const list = materialsForSubject(subject)
  const index = list.findIndex((material) => material.id === id)
  return {
    previous: index > 0 ? list[index - 1] : null,
    next: index >= 0 && index < list.length - 1 ? list[index + 1] : null,
  }
}
