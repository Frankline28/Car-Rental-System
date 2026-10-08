import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

const thunk = (type, fn) =>
  createAsyncThunk(type, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue(e.message || 'Something went wrong. Try again.');
    }
  });

export const fetchMyBookings = thunk('bookings/mine', () => api.getMyBookings());
export const fetchAllBookings = thunk('bookings/all', () => api.getAllBookings());
export const createBooking = thunk('bookings/create', (data) => api.createBooking(data));
export const updateBooking = thunk('bookings/update', ({ id, data }) => api.updateBooking(id, data));
export const cancelBooking = thunk('bookings/cancel', (id) => api.cancelBooking(id));

const replace = (list, item) => {
  const i = list.findIndex((x) => x.id === item.id);
  if (i >= 0) list[i] = item;
};

const slice = createSlice({
  name: 'bookings',
  initialState: { mine: [], all: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (b) => {
    [fetchMyBookings, fetchAllBookings].forEach((t) =>
      b
        .addCase(t.pending, (s) => {
          s.status = 'loading';
          s.error = null;
        })
        .addCase(t.rejected, (s, a) => {
          s.status = 'error';
          s.error = a.payload || a.error.message;
        })
    );
    b.addCase(fetchMyBookings.fulfilled, (s, a) => {
      s.status = 'ready';
      s.mine = a.payload;
    })
      .addCase(fetchAllBookings.fulfilled, (s, a) => {
        s.status = 'ready';
        s.all = a.payload;
      })
      .addCase(createBooking.fulfilled, (s, a) => {
        s.mine.unshift(a.payload);
      });
    [updateBooking, cancelBooking].forEach((t) =>
      b.addCase(t.fulfilled, (s, a) => {
        replace(s.mine, a.payload);
        replace(s.all, a.payload);
      })
    );
  },
});

export default slice.reducer;
