import JSZip from 'jszip';
import { apiService } from '../services/apiService';

export async function downloadJavaSpringBootZip(): Promise<void> {
  const zip = new JSZip();

  // Add all current Java project files from apiService (including Admin edits)
  const rootFolder = zip.folder('college-event-hub-backend');
  const files = apiService.getJavaFiles();

  files.forEach(file => {
    if (rootFolder) {
      rootFolder.file(file.path, file.content);
    } else {
      zip.file(file.path, file.content);
    }
  });

  // Generate zip as Blob
  const content = await zip.generateAsync({ type: 'blob' });

  // Trigger browser download
  const downloadUrl = URL.createObjectURL(content);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = 'college-event-hub-spring-boot.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(downloadUrl);
}
