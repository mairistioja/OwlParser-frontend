export function minimizeOwlId(id, model) {
  let modelId = model.metadata.id;

  // Remove trailing /# characters from modelId, if any:
  for (const c in ["#", "/"])
    if (modelId.endsWith(c))
      modelId = modelId.slice(0, -1);

  if (id.length > modelId.length + 1
      && id.startsWith(modelId)
      && "/#".includes(id[modelId.length]))
    return id.substring(modelId.length + 1);
  return id;
}

export function insertToSortedArrayIndex(array, element, comp = (a, b) => a < b) {
  let i = 0;
  while (i < array.length && comp(array[i], element))
    i++;
  return i;
}

export function insertToSortedArray(array, element, comp = (a, b) => a < b) {
  array.splice(insertToSortedArrayIndex(array, element, comp), 0, element);
  return array;
}

export function insertToSortedUniqueArray(array, element, comp = (a, b) => a < b) {
  const i = insertToSortedArrayIndex(array, element, comp);
  if (i >= array.length || comp(element, array[i])) // not equal
    array.splice(i, 0, element);
  return array;
}
