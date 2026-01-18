import { getMatchProfiles } from './matchProfiles';
import { sendMatchIntroductionEmail } from './emailTemplates';
import { addMatchToSheet } from './googleSheets';

function calculateScore(profile1: any, profile2: any): number {
  let score = 0;
  
  // Age compatibility (0-20 points)
  const ageDiff = Math.abs(profile1.age - profile2.age);
  if (ageDiff <= 2) score += 20;
  else if (ageDiff <= 5) score += 15;
  else if (ageDiff <= 10) score += 10;
  
  // Location compatibility (0-15 points)
  if (profile1.location === profile2.location) score += 15;
  
  // Religious compatibility (0-25 points)
  if (profile1.religiousObservance === profile2.religiousObservance) score += 25;
  else if (profile1.religiousObservance && profile2.religiousObservance) {
    // Similar religious observance
    const similar = ['Orthodox', 'Conservative', 'Reform'];
    if (similar.includes(profile1.religiousObservance) && similar.includes(profile2.religiousObservance)) {
      score += 15;
    }
  }
  
  // Professional compatibility (0-15 points)
  if (profile1.industry === profile2.industry) score += 15;
  
  // Shared interests (0-25 points)
  const interests1 = profile1.interests.toLowerCase().split(/[,\s]+/).filter((i: string) => i.length > 2);
  const interests2 = profile2.interests.toLowerCase().split(/[,\s]+/).filter((i: string) => i.length > 2);
  const shared = interests1.filter((i: string) => interests2.includes(i));
  if (shared.length > 0) {
    score += Math.min(25, shared.length * 5);
  }
  
  return Math.min(100, score);
}

export async function sendMatchEmails(userId1: string, userId2: string): Promise<void> {
  const { profile1, profile2, compatibilityHighlights } = await getMatchProfiles(userId1, userId2);
  
  // Send emails to both users
  await Promise.all([
    sendMatchIntroductionEmail({
      recipientName: profile1.name,
      recipientEmail: profile1.email,
      matchProfile: profile2,
      compatibilityHighlights,
    }),
    sendMatchIntroductionEmail({
      recipientName: profile2.name,
      recipientEmail: profile2.email,
      matchProfile: profile1,
      compatibilityHighlights,
    }),
  ]);
  
  // Record match in Google Sheets "Matches" tab
  await addMatchToSheet({
    userId1,
    userId2,
    compatibilityScore: calculateScore(profile1, profile2),
    matchDate: new Date().toISOString(),
  });
}

