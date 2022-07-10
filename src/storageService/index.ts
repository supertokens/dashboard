export const getValueFromStorage = (key: string): string | null => {
  const value = localStorage.getItem(key);
  return value;
}

export const setValueToStorage = (key: string, value: string): string => {
  localStorage.setItem(key, value);
  return value;
}

export const clearValueInStorage = (key: string) => {
  localStorage.removeItem(key);
}