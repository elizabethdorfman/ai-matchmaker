import { z } from 'zod';

export const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  heightFeet: z.number().min(4).max(8, 'Height must be between 4 and 8 feet'),
  heightInches: z.number().min(0).max(11, 'Inches must be between 0 and 11'),
  location: z.string().min(1, 'Location is required'),
  locationOther: z.string().optional(),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  religiousObservance: z.string().min(1, 'Religious observance is required'),
  religiousObservanceOther: z.string().optional(),
  education: z.string().min(1, 'Education level is required'),
  university: z.string().optional(),
  role: z.string().min(1, 'Role is required'),
  company: z.string().min(1, 'Company is required'),
  industry: z.string().min(1, 'Industry is required'),
  interests: z.string().min(10, 'Please provide at least 10 characters'),
  values: z.string().min(10, 'Please provide at least 10 characters'),
  agePreferenceMin: z.number().min(18),
  agePreferenceMax: z.number().min(18),
  otherPreferences: z.string().optional(),
  instagramHandle: z.string().optional(),
  linkedInUrl: z.string().url('Invalid URL').optional().or(z.literal('')),
  privacyAccepted: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  termsAccepted: z.boolean().refine(val => val === true, 'You must accept the terms of service'),
  findersFeeAccepted: z.boolean().refine(val => val === true, 'You must acknowledge the finders fee policy'),
}).refine(data => data.agePreferenceMax >= data.agePreferenceMin, {
  message: 'Maximum age must be greater than or equal to minimum age',
  path: ['agePreferenceMax'],
});

export type FormData = z.infer<typeof formSchema>;

export const LOCATIONS = ['Toronto', 'Other'];
export const RELIGIOUS_OBSERVANCE = ['Orthodox', 'Conservative', 'Reform', 'Secular', 'Other'];
export const RELIGIOUS_OBSERVANCE_NO_OTHER = ['Orthodox', 'Conservative', 'Reform', 'Secular'];
export const EDUCATION_LEVELS = ['High School', "Bachelor's", "Master's", 'PhD', 'Professional Degree', 'Other'];
export const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Law', 'Education', 'Business', 'Arts & Entertainment', 'Other'];

