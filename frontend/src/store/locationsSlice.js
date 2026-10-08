import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';

export const fetchLocations = createAsyncThunk('locations/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const rows = await api.getLocations();
    return [...new Set((rows || []).map((row) => typeof row === 'string' ? row : row.name).filter(Boolean))].sort();
  } catch (error) {
    return rejectWithValue(error.message || 'Could not load pickup locations.');
  }
});

const slice = createSlice({
  name: 'locations',
  initialState: { items: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLocations.pending, (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchLocations.fulfilled, (state, action) => { state.status = 'ready'; state.items = action.payload; })
      .addCase(fetchLocations.rejected, (state, action) => { state.status = 'error'; state.error = action.payload || action.error.message; });
  },
});

export default slice.reducer;
