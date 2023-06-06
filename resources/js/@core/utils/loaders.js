export const loadings = ref([])

export const load = i => {
  loadings.value[i] = true
}
export const stopLoad = i => {
  loadings.value[i] = false
}
