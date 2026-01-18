import { getSheetData } from './googleSheets';

export interface MatchProfile {
  userId: string;
  name: string;
  age: number;
  height: string;
  location: string;
  email: string;
  phone: string;
  religiousObservance: string;
  education: string;
  university?: string;
  role: string;
  company: string;
  industry: string;
  interests: string;
  values: string;
  headshotUrl: string;
  fullBodyPhotoUrl: string;
  videoUrl: string;
  instagramHandle?: string;
  linkedInUrl?: string;
  compatibilityScore?: number;
  compatibilityHighlights?: string[];
}

export async function getMatchProfile(userId: string): Promise<MatchProfile | null> {
  const userData = await getSheetData(userId);
  
  if (!userData) return null;
  
  return {
    userId: userData['User ID'] || userId,
    name: userData.Name || '',
    age: parseInt(userData.Age) || 0,
    height: userData.Height || '',
    location: userData.Location || '',
    email: userData.Email || '',
    phone: userData.Phone || '',
    religiousObservance: userData['Religious Observance'] || '',
    education: userData.Education || '',
    university: userData.University || '',
    role: userData.Role || '',
    company: userData.Company || '',
    industry: userData.Industry || '',
    interests: userData.Interests || '',
    values: userData.Values || '',
    headshotUrl: userData['Headshot Photo URL'] || '',
    fullBodyPhotoUrl: userData['Full Body Photo URL'] || '',
    videoUrl: userData['Video URL'] || '',
    instagramHandle: userData['Instagram Handle'] || '',
    linkedInUrl: userData['LinkedIn URL'] || '',
  };
}

export async function getMatchProfiles(userId1: string, userId2: string): Promise<{
  profile1: MatchProfile;
  profile2: MatchProfile;
  compatibilityHighlights: string[];
}> {
  const [profile1, profile2] = await Promise.all([
    getMatchProfile(userId1),
    getMatchProfile(userId2),
  ]);
  
  if (!profile1 || !profile2) {
    throw new Error('Could not fetch one or both profiles');
  }
  
  const highlights = calculateCompatibility(profile1, profile2);
  
  return {
    profile1,
    profile2,
    compatibilityHighlights: highlights,
  };
}

function calculateCompatibility(p1: MatchProfile, p2: MatchProfile): string[] {
  const highlights: string[] = [];
  
  // Age compatibility
  if (Math.abs(p1.age - p2.age) <= 5) {
    highlights.push(`Similar age (${p1.age} & ${p2.age})`);
  }
  
  // Location compatibility
  if (p1.location === p2.location) {
    highlights.push(`Both in ${p1.location}`);
  }
  
  // Religious compatibility
  if (p1.religiousObservance === p2.religiousObservance) {
    highlights.push(`Same religious observance level`);
  }
  
  // Professional compatibility
  if (p1.industry === p2.industry) {
    highlights.push(`Both in ${p1.industry} industry`);
  }
  
  // Shared interests (simple keyword matching)
  const interests1 = p1.interests.toLowerCase().split(/[,\s]+/);
  const interests2 = p2.interests.toLowerCase().split(/[,\s]+/);
  const shared = interests1.filter(i => i.length > 2 && interests2.includes(i));
  if (shared.length > 0) {
    highlights.push(`Shared interests: ${shared.slice(0, 2).join(', ')}`);
  }
  
  return highlights;
}

