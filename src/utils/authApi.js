export const authRequest = async (path, body) => {
  const response = await fetch(`/api/auth/${path}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The authentication server returned an invalid response.');
  }

  if (!response.ok) {
    throw new Error(result.error || 'Authentication request failed.');
  }
  return result;
};
