export async function uploadPhoto(file: File, userId: string, type: 'headshot' | 'fullbody'): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'matchmaker_photos');
  formData.append('folder', `users/${userId}`);
  // Use a more specific public_id to ensure uniqueness and prevent conflicts
  formData.append('public_id', `${userId}_${type}`);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME environment variable.');
  }
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { error: { message: response.statusText } };
    }
    const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    console.error('Cloudinary upload error:', { errorData, cloudName, responseStatus: response.status });
    throw new Error(`Failed to upload ${type} photo: ${errorMessage}`);
  }

  const data = await response.json();
  return data.secure_url;
}

export async function uploadVideo(file: File, userId: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'matchmaker_videos');
  formData.append('folder', `users/${userId}`);
  formData.append('public_id', `${userId}_intro-video`);

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  
  if (!cloudName) {
    throw new Error('Cloudinary cloud name is not configured. Please set VITE_CLOUDINARY_CLOUD_NAME environment variable.');
  }
  
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    { method: 'POST', body: formData }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(`Failed to upload video: ${errorMessage}`);
  }

  const data = await response.json();
  return data.secure_url;
}

