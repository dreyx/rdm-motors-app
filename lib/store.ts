import fs from 'fs/promises';
import path from 'path';
import { MOCK_VEHICLES_DATA } from './mock-vehicles';
import { getVehiclesFromGitHub, saveVehiclesToGitHub } from './github-store';

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
  if (process.env.GITHUB_TOKEN) return; // Skip in prod/GitHub mode
  const dir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

// Initialize data if not exists
async function initData() {
  if (process.env.GITHUB_TOKEN) return; // Skip in prod
  await ensureDataDir();
  try {
    await fs.access(DATA_FILE_PATH);
  } catch {
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(MOCK_VEHICLES_DATA, null, 2), 'utf-8');
  }
}

export async function getAllVehicles(): Promise<Vehicle[]> {
  // Priority: GitHub API (with retry and caching handled in github-store)
  if (process.env.GITHUB_TOKEN) {
    try {
      const vehicles = await getVehiclesFromGitHub();
      return vehicles; // Return even if empty - github-store handles caching/retries
    } catch (e) {
      console.error("Failed to fetch from GitHub:", e);
      // github-store will return cached data on failure, so this shouldn't happen often
      return [];
    }
  }

  // Fallback: Local File System
  await initData();
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading vehicles data from FS:", error);
    return [];
  }
}

export async function getVehiclesByStatus(status: string): Promise<Vehicle[]> {
  const vehicles = await getAllVehicles();
  return vehicles.filter(v => v.status === status);
}

export async function saveVehicles(vehicles: Vehicle[]) {
  // Priority: GitHub API
  if (process.env.GITHUB_TOKEN) {
    await saveVehiclesToGitHub(vehicles);
    // Continue to write to FS just in case (e.g. for revalidatePath to pick up something? mainly dev)
  }

  // Local File System
  try {
    await ensureDataDir();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(vehicles, null, 2), 'utf-8');
  } catch (e) {
    // Ignore FS errors in prod if GitHub worked
    if (!process.env.GITHUB_TOKEN) throw e;
  }
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
