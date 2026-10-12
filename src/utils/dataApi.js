export const dataRequest = async (path, { method = 'GET', body } = {}) => {
  const response = await fetch(`/api/data/${path}`, {
    method,
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The CivicEye server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'The CivicEye data request failed.');
  }
  return result;
};
