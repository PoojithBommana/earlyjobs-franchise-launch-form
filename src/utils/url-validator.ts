/**
 * Utility functions to validate and analyze URLs for database storage
 */

export interface UrlAnalysis {
  type: 's3' | 'data' | 'other' | 'empty';
  length: number;
  valid: boolean;
  storeable: boolean;
  reason?: string;
}

/**
 * Analyze a URL for database storage compatibility
 */
export const analyzeUrl = (url: string | undefined): UrlAnalysis => {
  if (!url) {
    return {
      type: 'empty',
      length: 0,
      valid: false,
      storeable: false,
      reason: 'No URL provided'
    };
  }

  const length = url.length;

  if (url.startsWith('https://')) {
    return {
      type: 's3',
      length,
      valid: true,
      storeable: true,
      reason: 'Valid S3/HTTPS URL'
    };
  }

  if (url.startsWith('data:image/')) {
    return {
      type: 'data',
      length,
      valid: true,
      storeable: false,
      reason: `Data URL too large for database (${length} chars, limit ~50k)`
    };
  }

  return {
    type: 'other',
    length,
    valid: false,
    storeable: false,
    reason: 'Unknown URL format'
  };
};

/**
 * Validate that a data object contains no data URLs
 */
export const validateNoDataUrls = (data: Record<string, any>): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string' && value.startsWith('data:image/')) {
      errors.push(`Field '${key}' contains a data URL (${value.length} characters)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Log URL analysis for debugging
 */
export const logUrlAnalysis = (urls: Record<string, string | undefined>) => {
  console.log('🔍 URL Analysis Report:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
  
  let s3Count = 0;
  let dataCount = 0;
  let otherCount = 0;
  
  for (const [fieldName, url] of Object.entries(urls)) {
    const analysis = analyzeUrl(url);
    
    const icon = analysis.storeable ? '✅' : '❌';
    const typeLabel = analysis.type.toUpperCase().padEnd(5);
    const lengthStr = analysis.length.toLocaleString().padStart(8);
    
    console.log(`${icon} ${fieldName.padEnd(20)} | ${typeLabel} | ${lengthStr} chars | ${analysis.reason}`);
    
    if (analysis.type === 's3') s3Count++;
    else if (analysis.type === 'data') dataCount++;
    else otherCount++;
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📊 Summary: ${s3Count} S3 URLs (storeable), ${dataCount} Data URLs (blocked), ${otherCount} Other`);
  console.log('');
};
