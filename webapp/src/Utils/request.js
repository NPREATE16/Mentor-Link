const GRAPHQL_SERVER = 'http://localhost:4000/graphql'


export const graphQLRequest = async (payload, options = {}) => {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...options,
  };

  const token = localStorage.getItem('token');
  if (token) headers.Authorization = `Bearer ${token}`;
  // console.log(headers.Authorization);
  const res = await fetch(GRAPHQL_SERVER, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  let parsed;
  try {
    parsed = await res.json();
  } catch (err) {
    console.error('Failed to parse JSON response from GraphQL server', err);
    throw err;
  }

  if (!res.ok) {
    console.error('GraphQL request failed', { status: res.status, body: parsed });
    return parsed;
  }

  return parsed;
};
