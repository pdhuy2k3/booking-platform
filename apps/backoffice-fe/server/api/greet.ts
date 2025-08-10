export default defineEventHandler((event) => {
  const name = getQuery(event).name || 'World';
  return `Hello, ${name}!`;
});