import fs from 'fs/promises';
import path from 'path';
import { MOCK_VEHICLES_DATA } from './mock-vehicles';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'vehicles.json');

export interface Vehicle {
  id: string;
  year: number;
  make: string;
  model: string;
  trim?: string | null;
  mileage: number;
  transmission: string;
  price: number;
  status: string;
  description?: string | null;
  engine?: string | null;
  drivetrain?: string | null;
  fuel_type?: string | null;
  exterior_color?: string | null;
  interior_color?: string | null;
  condition?: string | null;
  title_status?: string | null;
  vin?: string | null;
  stock_number?: string | null;
  created_at: string;
  image_url?: string | null;
  images: string[];
  body_style?: string | null;
  doors?: number | null;
  seats?: number | null;
}

// Ensure data directory exists
async function ensureDataDir() {
  const dir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Initialize data if not exists
async function initData() {
  await ensureDataDir();
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    // If file doesn't exist, seed it with mock data
    // Ensure mock data matches the Vehicle interface roughly (images is array of strings)
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(MOCK_VEHICLES_DATA, null, 2), 'utf-8');
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  await initData();
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading vehicles data:", error);
    return [];
  }
}

export async function getVehiclesByStatus(status: string): Promise<Vehicle[]> {
  const vehicles = await getAllVehicles();
  return vehicles.filter(v => v.status === status);
}

export async function saveVehicles(vehicles: Vehicle[]) {
  await ensureDataDir();
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(vehicles, null, 2), 'utf-8');
}

export async function addVehicleToStore(vehicle: Vehicle) {
  const vehicles = await getAllVehicles();
  vehicles.unshift(vehicle);
  await saveVehicles(vehicles);
  return vehicle;
}

export async function updateVehicleInStore(id: string, updates: Partial<Vehicle>) {
  const vehicles = await getAllVehicles();
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) throw new Error('Vehicle not found');
  
  const updatedVehicle = { ...vehicles[index], ...updates };
  vehicles[index] = updatedVehicle;
  await saveVehicles(vehicles);
  return updatedVehicle;
}

export async function deleteVehicleFromStore(id: string) {
  const vehicles = await getAllVehicles();
  const filtered = vehicles.filter(v => v.id !== id);
  await saveVehicles(filtered);
}
