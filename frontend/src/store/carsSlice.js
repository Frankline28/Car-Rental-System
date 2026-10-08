import { createAsyncThunk } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { makeCrud } from './crud';

export const fetchCar = createAsyncThunk('cars/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return await api.getCar(id);
  } catch (e) {
    return rejectWithValue(e.message);
  }
});

// Asks the backend which cars are free in a window and checks whether this one is among them.
export const checkAvailability = createAsyncThunk('cars/availability', async ({ carId, start, end }) => {
  const list = await api.getCars({ start, end });
  return list.some((c) => String(c.id) === String(carId));
});

const crud = makeCrud(
  'cars',
  {
    list: (p) => api.getCars(p),
    create: (d) => api.createCar(d),
    update: (id, d) => api.updateCar(id, d),
    remove: (id) => api.deleteCar(id),
  },
  {
    state: { current: null, currentStatus: 'idle', currentError: null, availability: 'idle' },
    build: (b) => {
      b.addCase(fetchCar.pending, (s) => {
        s.currentStatus = 'loading';
        s.currentError = null;
      })
        .addCase(fetchCar.fulfilled, (s, a) => {
          s.currentStatus = 'ready';
          s.current = a.payload;
        })
        .addCase(fetchCar.rejected, (s, a) => {
          s.currentStatus = 'error';
          s.currentError = a.payload || a.error.message;
        })
        .addCase(checkAvailability.pending, (s) => {
          s.availability = 'checking';
        })
        .addCase(checkAvailability.fulfilled, (s, a) => {
          s.availability = a.payload ? 'free' : 'busy';
        })
        .addCase(checkAvailability.rejected, (s) => {
          s.availability = 'idle';
        });
    },
  }
);

export const fetchCars = crud.fetchAll;
export const saveCar = crud.save;
export const removeCar = crud.remove;
export default crud.slice.reducer;
