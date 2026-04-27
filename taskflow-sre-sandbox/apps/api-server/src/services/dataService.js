// In-memory data store for simplicity
const dataStore = [
  { id: 1, name: 'Sample Item 1', status: 'active' },
  { id: 2, name: 'Sample Item 2', status: 'pending' }
];

let nextId = 3;

const getAllData = async () => {
  return dataStore;
};

const addData = async (payload) => {
  if (!payload || !payload.name) {
    const error = new Error('Name is required');
    error.statusCode = 400;
    throw error;
  }

  const newItem = {
    id: nextId++,
    name: payload.name,
    status: payload.status || 'pending',
    createdAt: new Date().toISOString()
  };

  dataStore.push(newItem);
  return newItem;
};

module.exports = {
  getAllData,
  addData
};
