export const fetchAllPages = async (fetchPage) => {
  const first = await fetchPage(1);
  return first;
};
