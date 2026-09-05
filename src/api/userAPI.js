import axios from "axios";
import { API_URL, requestConfig } from "./config";

export async function logout() {
  const response = await axios.post(`${API_URL}/auth/logout`, null, requestConfig);
  return response.data;
}

export async function getCurrentUser() {
  const response = await axios.get(`${API_URL}/auth/me`, requestConfig);
  return response.data;
}

export async function updateCurrentUser(updates) {
  const response = await axios.patch(`${API_URL}/auth/me`, updates, requestConfig);
  return response.data;
}

export async function deleteAccount() {
  const response = await axios.delete(`${API_URL}/auth/me`, requestConfig);
  return response.data;
}

export async function getUsers(params) {
  const response = await axios.get(`${API_URL}/users`, { ...requestConfig, params });
  return response.data;
}

export async function getUser(id) {
  const response = await axios.get(`${API_URL}/users/${id}`, requestConfig);
  return response.data;
}

export async function createClub(club) {
  const response = await axios.post(`${API_URL}/clubs`, club, requestConfig);
  return response.data;
}

export async function getClubs(params) {
  const response = await axios.get(`${API_URL}/clubs`, { ...requestConfig, params });
  return response.data;
}

export async function deleteClub(id) {
  const response = await axios.delete(`${API_URL}/clubs/${id}`, requestConfig);
  return response.data;
}

export async function updateClub(id, updates) {
  const response = await axios.patch(`${API_URL}/clubs/${id}`, updates, requestConfig);
  return response.data;
}

export async function addClubLeader(clubId, userId) {
  const response = await axios.put(`${API_URL}/clubs/${clubId}/leaders/${userId}`, null, requestConfig);
  return response.data;
}

export async function removeClubLeader(clubId, userId) {
  const response = await axios.delete(`${API_URL}/clubs/${clubId}/leaders/${userId}`, requestConfig);
  return response.data;
}

export async function createListing(listing) {
  const response = await axios.post(`${API_URL}/jobs/list`, listing, requestConfig);
  return response.data;
}

export async function getListings(params) {
  const response = await axios.get(`${API_URL}/jobs/listings`, { ...requestConfig, params });
  return response.data;
}

export async function getListing(id) {
  const response = await axios.get(`${API_URL}/jobs/listing/${id}`, requestConfig);
  return response.data;
}

export async function updateListing(id, updates) {
  const response = await axios.patch(`${API_URL}/jobs/listing/${id}`, updates, requestConfig);
  return response.data;
}