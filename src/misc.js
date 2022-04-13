export function minimizeOwlId(id, model) {
  const parts = id.split("#", 2);
  return parts[0] === model.metadata.id ? parts[1] : id;
}
