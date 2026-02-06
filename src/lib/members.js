/**
 * Fetch all divisions from the API
 * @returns {Promise<Array>} Array of division objects
 */
export async function fetchDivisions() {
  const res = await fetch('/api/v1/divisions');
  if (!res.ok) throw new Error('Failed to fetch divisions');
  const json = await res.json();
  return json.data || [];
}

/**
 * Fetch a single division by key
 * @param {string} key - The division key
 * @returns {Promise<Object|null>} Division object or null
 */
export async function fetchDivisionByKey(key) {
  const res = await fetch(`/api/v1/divisions/${key}`);
  if (!res.ok) return null;
  const json = await res.json();
  return json.data || null;
}

/**
 * Fetch all team members from the API
 * @returns {Promise<Array>} Array of member objects
 */
export async function fetchMembers() {
  const res = await fetch('/api/v1/teams');
  if (!res.ok) throw new Error('Failed to fetch team members');
  const json = await res.json();
  return json.data || [];
}

/**
 * Group members by division
 * @param {Array} members - Array of member objects
 * @returns {Object} Object with division keys as keys and member arrays as values
 */
export function groupByDivision(members) {
  const grouped = {};
  for (const member of members) {
    const divKey = (member.division || 'other').toLowerCase().replace(/\s+/g, '-');
    if (!grouped[divKey]) {
      grouped[divKey] = [];
    }
    grouped[divKey].push(member);
  }
  return grouped;
}
