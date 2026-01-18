export interface SignUpFormData {
  name: string;
  dateOfBirth: string;
  heightFeet: number;
  heightInches: number;
  location: string;
  locationOther?: string;
  email: string;
  phone: string;
  religiousObservance: string;
  religiousObservanceOther?: string;
  education: string;
  university?: string;
  role: string;
  company: string;
  industry: string;
  interests: string;
  values: string;
  agePreferenceMin: number;
  agePreferenceMax: number;
  otherPreferences?: string;
  instagramHandle?: string;
  linkedInUrl?: string;
  headshotPhotoUrl?: string;
  fullBodyPhotoUrl?: string;
  videoUrl?: string;
  privacyAccepted: boolean;
  termsAccepted: boolean;
  findersFeeAccepted: boolean;
  requestedMatchUserId?: string;
}

