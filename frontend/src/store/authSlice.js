import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api } from '@/lib/api';
import { session } from '@/lib/session';

// Backends name roles differently (ADMIN, user, ...). The UI only knows "admin" and "customer".
const normUser = (u) => ({ ...u, role: /admin/i.test(u?.role || '') ? 'admin' : 'customer' });

export const hydrateAuth = createAsyncThunk('auth/hydrate', async () => {
  const u = session.user();
  return u && session.token() ? normUser(u) : null;
});

const authCall = (type, fn) =>
  createAsyncThunk(type, async (body, { rejectWithValue }) => {
    try {
      const r = await fn(body);
      const user = normUser(r.user);
      session.save(r.token, user);
      return user;
    } catch (e) {
      return rejectWithValue(e.message || 'Could not sign you in.');
    }
  });

export const login = authCall('auth/login', (b) => api.login(b));
export const register = authCall('auth/register', (b) => api.register(b));

const slice = createSlice({
  name: 'auth',
  initialState: { user: null, hydrated: false, status: 'idle', error: null },
  reducers: {
    clearUser(s) {
      s.user = null;
      s.error = null;
    },
    clearAuthError(s) {
      s.error = null;
    },
  },
  extraReducers: (b) => {
    b.addCase(hydrateAuth.fulfilled, (s, a) => {
      s.user = a.payload;
      s.hydrated = true;
    });
    [login, register].forEach((t) => {
      b.addCase(t.pending, (s) => {
        s.status = 'loading';
        s.error = null;
      })
        .addCase(t.fulfilled, (s, a) => {
          s.status = 'idle';
          s.user = a.payload;
        })
        .addCase(t.rejected, (s, a) => {
          s.status = 'idle';
          s.error = a.payload;
        });
    });
  },
});

export const { clearUser, clearAuthError } = slice.actions;
export const logout = () => (dispatch) => {
  session.clear();
  dispatch(clearUser());
};
export default slice.reducer;
