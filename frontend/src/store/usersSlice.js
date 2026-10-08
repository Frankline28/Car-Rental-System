import { api } from '@/lib/api';
import { makeCrud } from './crud';

const crud = makeCrud('users', {
  list: () => api.getUsers(),
  update: (id, d) => api.updateUser(id, d),
  remove: (id) => api.deleteUser(id),
});

export const fetchUsers = crud.fetchAll;
export const saveUser = crud.save;
export const removeUser = crud.remove;
export default crud.slice.reducer;
