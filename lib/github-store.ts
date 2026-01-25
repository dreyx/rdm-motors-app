import { Vehicle } from './store';

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'your-username';
const GITHUB_REPO = process.env.GITHUB_REPO || 'rdm-motors-app';
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const FILE_PATH = 'data/vehicles.json';

// Read from GitHub Raw (Fast, Cached)
export async function getVehiclesFromGitHub(): Promise<Vehicle[]> {
    if (!GITHUB_TOKEN) return []; // Fallback or Error

    const url = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${FILE_PATH}`;
    try {
        const res = await fetch(url, {
            next: { revalidate: 60 } // Cache for 1 minute
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (error) {
        console.error("GitHub Fetch Error:", error);
        return [];
    }
}

// Write to GitHub API (Triggers Deploy)
export async function saveVehiclesToGitHub(vehicles: Vehicle[]) {
    if (!GITHUB_TOKEN) throw new Error("Missing GITHUB_TOKEN");

    // 1. Get current SHA of the file (required for update)
    const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${FILE_PATH}`;
    const getRes = await fetch(apiUrl, {
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
        }
    });

    let sha: string | undefined;
    if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
    }

    // 2. Commit the new content
    const content = Buffer.from(JSON.stringify(vehicles, null, 2)).toString('base64');
    const body = {
        message: `Update Inventory: ${vehicles.length} vehicles`,
        content: content,
        branch: GITHUB_BRANCH,
        sha: sha // If undefined, might create new file (check API behavior)
    };

    const putRes = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body)
    });

    if (!putRes.ok) {
        const err = await putRes.text();
        throw new Error(`GitHub Save Failed: ${err}`);
    }
}
