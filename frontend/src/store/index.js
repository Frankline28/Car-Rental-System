import { configureStore } from '@reduxjs/toolkit';
import auth from './authSlice';
import cars from './carsSlice';
import packages from './packagesSlice';
import users from './usersSlice';
import bookings from './bookingsSlice';
import locations from './locationsSlice';

export const makeStore = () => configureStore({ reducer: { auth, cars, packages, users, bookings, locations } });
