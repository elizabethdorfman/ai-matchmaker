import sgMail from '@sendgrid/mail';
import { MatchProfile } from './matchProfiles';

interface MatchEmailData {
  recipientName: string;
  recipientEmail: string;
  matchProfile: MatchProfile;
  compatibilityHighlights: string[];
}

export async function sendMatchIntroductionEmail(data: MatchEmailData): Promise<void> {
  const { recipientName, recipientEmail, matchProfile, compatibilityHighlights } = data;
  
  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #f4f4f4; padding: 20px; text-align: center; }
        .profile-section { margin: 20px 0; }
        .photo { max-width: 100%; border-radius: 8px; margin: 10px 0; }
        .video { max-width: 100%; margin: 10px 0; }
        .highlights { background: #e8f5e9; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .cta-button { background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>We Found a Match for You!</h1>
        </div>
        
        <p>Hi ${recipientName},</p>
        
        <p>We're excited to introduce you to ${matchProfile.name}!</p>
        
        <div class="highlights">
          <h3>Why We Think You're a Great Match:</h3>
          <ul>
            ${compatibilityHighlights.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
        
        <div class="profile-section">
          <h2>About ${matchProfile.name}</h2>
          
          <img src="${matchProfile.headshotUrl}" alt="${matchProfile.name}" class="photo" />
          
          <p><strong>Age:</strong> ${matchProfile.age}</p>
          <p><strong>Height:</strong> ${matchProfile.height}</p>
          <p><strong>Location:</strong> ${matchProfile.location}</p>
          <p><strong>Religious Observance:</strong> ${matchProfile.religiousObservance}</p>
          
          <h3>Professional</h3>
          <p><strong>Role:</strong> ${matchProfile.role} at ${matchProfile.company}</p>
          <p><strong>Industry:</strong> ${matchProfile.industry}</p>
          <p><strong>Education:</strong> ${matchProfile.education}${matchProfile.university ? ` from ${matchProfile.university}` : ''}</p>
          
          <h3>Interests</h3>
          <p>${matchProfile.interests}</p>
          
          <h3>Values</h3>
          <p>${matchProfile.values}</p>
          
          ${matchProfile.fullBodyPhotoUrl ? `<img src="${matchProfile.fullBodyPhotoUrl}" alt="${matchProfile.name} - Full body" class="photo" />` : ''}
          
          ${matchProfile.videoUrl ? `
          <h3>Introduction Video</h3>
          <video controls class="video">
            <source src="${matchProfile.videoUrl}" type="video/mp4">
            Your browser does not support the video tag.
          </video>
          ` : ''}
          
          ${matchProfile.instagramHandle ? `<p><strong>Instagram:</strong> <a href="https://instagram.com/${matchProfile.instagramHandle.replace('@', '')}">${matchProfile.instagramHandle}</a></p>` : ''}
          ${matchProfile.linkedInUrl ? `<p><strong>LinkedIn:</strong> <a href="${matchProfile.linkedInUrl}">View Profile</a></p>` : ''}
        </div>
        
        <div style="text-align: center;">
          <p><strong>Contact Information:</strong></p>
          <p>Email: ${matchProfile.email || 'Contact us for email'}</p>
          <p>Phone: ${matchProfile.phone || 'Contact us for phone'}</p>
        </div>
        
        <p>We hope this connection leads to something meaningful!</p>
        
        <p>Best,<br>The Matchmaker Team</p>
      </div>
    </body>
    </html>
  `;
  
  const emailText = `
    Hi ${recipientName},
    
    We found a match for you! Meet ${matchProfile.name}:
    
    Age: ${matchProfile.age}
    Location: ${matchProfile.location}
    Role: ${matchProfile.role} at ${matchProfile.company}
    
    Compatibility Highlights:
    ${compatibilityHighlights.map(h => `- ${h}`).join('\n')}
    
    Contact: ${matchProfile.email || 'Contact us'}
    
    Best,
    The Matchmaker Team
  `;
  
  sgMail.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);
  
  await sgMail.send({
    to: recipientEmail,
    from: 'matches@yourdomain.com', // This should be a verified sender
    subject: `We Found a Match for You: ${matchProfile.name}`,
    text: emailText,
    html: emailHtml,
  });
}

