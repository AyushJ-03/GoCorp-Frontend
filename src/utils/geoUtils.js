export const isValidPos = (pos) => {
  return pos && Array.isArray(pos) && pos.length === 2 && 
         typeof pos[0] === 'number' && typeof pos[1] === 'number' &&
         !isNaN(pos[0]) && !isNaN(pos[1]);
};

export const getDistance = (p1, p2) => {
  if (!isValidPos(p1) || !isValidPos(p2)) return 0;
  const R = 6371e3; // meters
  const φ1 = p1[0] * Math.PI / 180;
  const φ2 = p2[0] * Math.PI / 180;
  const Δφ = (p2[0] - p1[0]) * Math.PI / 180;
  const Δλ = (p2[1] - p1[1]) * Math.PI / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};
