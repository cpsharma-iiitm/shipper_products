import { catalogData } from './fixtures/catalogData';

export const getCatalog = async () => catalogData;
export const getProductById = async (id) => catalogData.find((item) => item.id === id) || null;
