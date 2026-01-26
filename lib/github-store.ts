import { Vehicle } from './store';

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-username';
const GITHUB_REPO = process.env.GITHUB_REPO || 'rdm-motors-app';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FILE_PATH = 'data/vehicles.json';

// In-memory cache to provide immediate consistency after writes
let vehicleCache: Vehicle[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL_MS = 60000; // 1 minute cache for consistency during deploys

// Read from GitHub API with retry logic and timeout
export async function getVehiclesFromGitHub(): Promise<Vehicle[]> {
    if (!GITHUB_TOKEN) return [];

    // Return cached data if fresh (provides consistency during deploy window)
    if (vehicleCache && (Date.now() - cacheTimestamp) < CACHE_TTL_MS) {
        return vehicleCache;
    }

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

    // Retry logic for transient GitHub API failures
    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            // Add timeout to prevent hanging requests
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

            const res = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                },
                cache: 'no-store',
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!res.ok) {
                if (res.status === 404) {
                    // File doesn't exist yet - return empty array
                    return [];
                }
                throw new Error(`GitHub API returned ${res.status}: ${res.statusText}`);
            }

            const data = await res.json();
            if (!data.content) {
                console.warn("GitHub response missing content field");
                return vehicleCache || []; // Return cached data if available
            }

            const content = Buffer.from(data.content, 'base64').toString('utf-8');
            const vehicles = JSON.parse(content);

            // Update cache
            vehicleCache = vehicles;
            cacheTimestamp = Date.now();

            return vehicles;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));

            // Don't retry on abort (timeout)
            if (error instanceof Error && error.name === 'AbortError') {
                console.error(`GitHub API request timed out (attempt ${attempt}/${maxRetries})`);
            } else {
                console.error(`GitHub fetch attempt ${attempt}/${maxRetries} failed:`, error);
            }

            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    // All retries failed - return cached data if available
    console.error("All GitHub fetch attempts failed:", lastError);
    if (vehicleCache) {
        console.log("Returning cached vehicle data");
        return vehicleCache;
    }

    return [];
}

// Write to GitHub API with retry logic
export async function saveVehiclesToGitHub(vehicles: Vehicle[]) {
    if (!GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN");

    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;

    // 1. Get current SHA of the file (required for update)
    let sha: string | undefined;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const getRes = await fetch(apiUrl, {
            headers: {
                'Authorization': `Bearer ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (getRes.ok) {
            const data = await getRes.json();
            sha = data.sha;
        }
    } catch (error) {
        console.warn("Failed to get file SHA, attempting to create new file:", error);
    }

    // 2. Commit the new content with retry
    const content = Buffer.from(JSON.stringify(vehicles, null, 2)).toString('base64');
    const body = {
        message: `Update Inventory: ${vehicles.length} vehicles`,
        content: content,
        branch: GITHUB_BRANCH,
        sha: sha
    };

    const maxRetries = 3;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout for writes

            const putRes = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!putRes.ok) {
                const err = await putRes.text();
                throw new Error(`GitHub Save Failed (${putRes.status}): ${err}`);
            }

            // SUCCESS - Update cache immediately for consistency
            vehicleCache = vehicles;
            cacheTimestamp = Date.now();

            return;
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            console.error(`GitHub save attempt ${attempt}/${maxRetries} failed:`, error);

            if (attempt < maxRetries) {
                await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
            }
        }
    }

    throw lastError || new Error("GitHub save failed after all retries");
}

// Clear the cache (useful for forcing a fresh fetch)
export function clearVehicleCache() {
    vehicleCache = null;
    cacheTimestamp = 0;
}

// Update cache directly (for immediate consistency after local operations)
export function updateVehicleCache(vehicles: Vehicle[]) {
    vehicleCache = vehicles;
    cacheTimestamp = Date.now();
}
