export interface EnrolledBiometricUser {
  id: string;
  student_or_emp_id: string;
  first_name: string;
  last_name: string;
  role: "faculty" | "staff" | "student";
  grade_section: string;
  avatar_url: string;
  backup_pin: string;
  face_vector: number[];
  enrolled_at: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __TECHXODIA_BIOMETRIC_REGISTRY__: Map<string, EnrolledBiometricUser> | undefined;
}

/**
 * Generates a normalized synthetic biometric vector from a seed string.
 * Used for seeded users so that each person has a unique, distinct 192D/512D biometric footprint.
 */
function createSeededVector(seed: string, dimensions = 192): number[] {
  const vec = new Array(dimensions);
  let sumSq = 0;
  for (let i = 0; i < dimensions; i++) {
    // Generate pseudo-random deterministic component based on seed and index
    let hash = 0;
    const str = `${seed}-dim-${i}`;
    for (let j = 0; j < str.length; j++) {
      hash = (hash << 5) - hash + str.charCodeAt(j);
      hash |= 0;
    }
    const val = (Math.sin(hash) * 10000) % 1;
    vec[i] = val;
    sumSq += val * val;
  }
  const norm = Math.sqrt(sumSq) || 1;
  return vec.map((v) => Number((v / norm).toFixed(6)));
}

/**
 * Pre-enrolled school population with distinct biometric templates and backup PINs.
 * Brandon Jake A. Torres is enrolled with his own distinct vector.
 * Other users (Elena, Sophia, Marcus, Daniel) each have completely separate vectors.
 */
const DEFAULT_ENROLLED_USERS: EnrolledBiometricUser[] = [
  {
    id: "user-brandon-torres-101",
    student_or_emp_id: "TEST1234",
    first_name: "Brandon Jake A.",
    last_name: "Torres",
    role: "faculty",
    grade_section: "Faculty • HR",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80",
    backup_pin: "1234",
    face_vector: createSeededVector("brandon-jake-torres-face-v1", 192),
    enrolled_at: "2026-10-10T08:00:00Z",
  },
  {
    id: "e4eebc99-9c0b-4ef8-bb6d-6bb9bd380e55",
    student_or_emp_id: "EMP-1042",
    first_name: "Elena",
    last_name: "Rostova",
    role: "faculty",
    grade_section: "Faculty of Science - Chemistry",
    avatar_url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=256&auto=format&fit=crop&q=80",
    backup_pin: "1042",
    face_vector: createSeededVector("elena-rostova-face-v1", 192),
    enrolled_at: "2026-10-10T08:00:00Z",
  },
  {
    id: "c2eebc99-9c0b-4ef8-bb6d-6bb9bd380c33",
    student_or_emp_id: "STU-2026-0891",
    first_name: "Sophia",
    last_name: "Chen",
    role: "student",
    grade_section: "Grade 11 - STEM A",
    avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=256&auto=format&fit=crop&q=80",
    backup_pin: "0891",
    face_vector: createSeededVector("sophia-chen-face-v1", 192),
    enrolled_at: "2026-10-10T08:00:00Z",
  },
  {
    id: "d3eebc99-9c0b-4ef8-bb6d-6bb9bd380d44",
    student_or_emp_id: "STU-2026-0892",
    first_name: "Marcus",
    last_name: "Vance",
    role: "student",
    grade_section: "Grade 10 - Section B",
    avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=256&auto=format&fit=crop&q=80",
    backup_pin: "8821",
    face_vector: createSeededVector("marcus-vance-face-v1", 192),
    enrolled_at: "2026-10-10T08:00:00Z",
  },
];

export function getBiometricRegistry(): Map<string, EnrolledBiometricUser> {
  if (!globalThis.__TECHXODIA_BIOMETRIC_REGISTRY__) {
    const map = new Map<string, EnrolledBiometricUser>();
    for (const u of DEFAULT_ENROLLED_USERS) {
      map.set(u.student_or_emp_id.toUpperCase(), u);
      map.set(u.id, u);
    }
    globalThis.__TECHXODIA_BIOMETRIC_REGISTRY__ = map;
  }
  return globalThis.__TECHXODIA_BIOMETRIC_REGISTRY__;
}

export function registerEnrolledUser(user: Partial<EnrolledBiometricUser> & { student_or_emp_id: string; first_name: string; last_name: string; face_vector: number[] }): EnrolledBiometricUser {
  const registry = getBiometricRegistry();
  const id = user.id || `user-enrolled-${Date.now()}`;
  const fullUser: EnrolledBiometricUser = {
    id,
    student_or_emp_id: user.student_or_emp_id,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role || "student",
    grade_section: user.grade_section || "General Class",
    avatar_url: user.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=256&auto=format&fit=crop&q=80",
    backup_pin: user.backup_pin || "1234",
    face_vector: user.face_vector,
    enrolled_at: user.enrolled_at || new Date().toISOString(),
  };

  registry.set(fullUser.student_or_emp_id.toUpperCase(), fullUser);
  registry.set(fullUser.id, fullUser);
  return fullUser;
}

export function findUserByPin(pin: string, idOrEmpId?: string): EnrolledBiometricUser | null {
  const registry = getBiometricRegistry();
  const cleanPin = pin.trim();

  // If student_or_emp_id provided, verify directly
  if (idOrEmpId) {
    const user = registry.get(idOrEmpId.trim().toUpperCase());
    if (user && user.backup_pin === cleanPin) {
      return user;
    }
  }

  // Otherwise search registry for this unique PIN
  for (const user of Array.from(registry.values())) {
    if (user.backup_pin === cleanPin) {
      return user;
    }
  }

  return null;
}

/**
 * Computes Cosine Similarity between two L2-normalized vectors.
 * Returns value between -1.0 and 1.0 (typically 0.0 to 1.0 for embeddings).
 */
export function computeCosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
  const len = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < len; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

export interface MatchResult {
  matched: boolean;
  user: EnrolledBiometricUser | null;
  similarity: number;
}

/**
 * Compares an incoming face vector against ALL enrolled templates.
 * ONLY matches if the cosine similarity meets or exceeds the strict threshold (default: 0.72).
 * If unknown face or below threshold, returns { matched: false, user: null }.
 */
export function matchFaceVector(
  queryVector: number[],
  threshold = 0.72
): MatchResult {
  if (!queryVector || queryVector.length === 0) {
    return { matched: false, user: null, similarity: 0 };
  }

  const registry = getBiometricRegistry();
  let bestUser: EnrolledBiometricUser | null = null;
  let maxSimilarity = -1;

  // Set to avoid duplicates since map contains both ID and student_or_emp_id keys
  const checkedUsers = new Set<string>();

  for (const user of Array.from(registry.values())) {
    if (checkedUsers.has(user.id)) continue;
    checkedUsers.add(user.id);

    const sim = computeCosineSimilarity(queryVector, user.face_vector);
    if (sim > maxSimilarity) {
      maxSimilarity = sim;
      bestUser = user;
    }
  }

  if (bestUser && maxSimilarity >= threshold) {
    return {
      matched: true,
      user: bestUser,
      similarity: maxSimilarity,
    };
  }

  return {
    matched: false,
    user: null,
    similarity: maxSimilarity > 0 ? maxSimilarity : 0,
  };
}
