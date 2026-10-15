export const workflowRequest = async (action, body) => {
  const response = await fetch(`/api/workflow/${action}`, {
    method: body === undefined ? 'GET' : 'POST',
    credentials: 'same-origin',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The workflow service returned an invalid response.');
  }
  if (!response.ok) throw new Error(result.error || 'The workflow request failed.');
  return result;
};

export const uploadWorkerEvidence = async (file, complaintId) => {
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
    throw new Error('Evidence photos must be JPEG, PNG, or WebP images.');
  }
  if (file.size < 1 || file.size > 5 * 1024 * 1024) {
    throw new Error('Each evidence photo must be no larger than 5 MB.');
  }

  const response = await fetch(`/api/workflow/upload?complaintId=${encodeURIComponent(complaintId)}`, {
    method: 'POST',
    credentials: 'same-origin',
    headers: { 'Content-Type': file.type },
    body: file
  });
  let result;
  try {
    result = await response.json();
  } catch {
    throw new Error('The evidence upload service returned an invalid response.');
  }
  if (!response.ok) {
    throw new Error(result.error || 'The evidence photo could not be uploaded.');
  }

  return {
    id: result.id,
    pathname: result.pathname,
    contentType: result.contentType,
    size: result.size
  };
};
