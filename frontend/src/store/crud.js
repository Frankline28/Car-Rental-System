import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';

const msg = (e) => e?.message || 'Something went wrong. Try again.';

/** Builds list + save (create/update) + remove thunks and a slice for one resource. */
export function makeCrud(name, fns, extra = {}) {
  const fetchAll = createAsyncThunk(`${name}/fetchAll`, async (params, { rejectWithValue }) => {
    try {
      return await fns.list(params);
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  });
  const save = createAsyncThunk(`${name}/save`, async ({ id, data }, { rejectWithValue }) => {
    try {
      if (!id && !fns.create) throw new Error('Creating this resource is not supported by the API.');
      return id ? await fns.update(id, data) : await fns.create(data);
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  });
  const remove = createAsyncThunk(`${name}/remove`, async (id, { rejectWithValue }) => {
    try {
      await fns.remove(id);
      return id;
    } catch (e) {
      return rejectWithValue(msg(e));
    }
  });

  const slice = createSlice({
    name,
    initialState: { items: [], status: 'idle', error: null, ...(extra.state || {}) },
    reducers: {},
    extraReducers: (b) => {
      b.addCase(fetchAll.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
        .addCase(fetchAll.fulfilled, (s, a) => {
          s.status = 'ready';
          s.items = Array.isArray(a.payload) ? a.payload : a.payload?.items || [];
        })
        .addCase(fetchAll.rejected, (s, a) => {
          s.status = 'error';
          s.error = a.payload || a.error.message;
        })
        .addCase(save.fulfilled, (s, a) => {
          const i = s.items.findIndex((x) => x.id === a.payload.id);
          if (i >= 0) s.items[i] = a.payload;
          else s.items.unshift(a.payload);
        })
        .addCase(remove.fulfilled, (s, a) => {
          s.items = s.items.filter((x) => x.id !== a.payload);
        });
      extra.build?.(b);
    },
  });
  return { slice, fetchAll, save, remove };
}
