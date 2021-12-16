export default async function fetchTenants(token, apiUrl) {
  const query = {
    query: `{
    tenants {
      name
      id
      initialized
    }
  }
  `,
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    cache: 'no-cache',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(query),
  });
  const json = await response.json();
  return json.data.tenants;
}
