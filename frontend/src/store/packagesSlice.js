import { api } from '@/lib/api';
import { makeCrud } from './crud';

const crud = makeCrud('packages', {
  list: () => api.getPackages(),
  create: (d) => api.createPackage(d),
  update: (id, d) => api.updatePackage(id, d),
  remove: (id) => api.deletePackage(id),
});

export const fetchPackages = crud.fetchAll;
export const savePackage = crud.save;
export const removePackage = crud.remove;
export default crud.slice.reducer;
