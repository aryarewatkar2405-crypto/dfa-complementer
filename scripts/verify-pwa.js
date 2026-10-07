async function verifyEndpoints() {
  const urls = [
    'http://localhost:4173/',
    'http://localhost:4173/manifest.webmanifest',
    'http://localhost:4173/manifest.json',
    'http://localhost:4173/sw.js',
    'http://localhost:4173/pwa-192x192.png',
    'http://localhost:4173/pwa-512x512.png',
    'http://localhost:4173/pwa-maskable-192x192.png',
    'http://localhost:4173/pwa-maskable-512x512.png',
    'http://localhost:4173/apple-touch-icon.png',
    'http://localhost:4173/favicon.svg'
  ];

  let allPassed = true;
  for (const url of urls) {
    try {
      const res = await fetch(url);
      const ok = res.status === 200;
      const contentType = res.headers.get('content-type') || '';
      const size = (await res.arrayBuffer()).byteLength;
      console.log(`${ok ? '✓' : '✗'} ${res.status} ${url} (${contentType}) - ${size} bytes`);
      if (!ok) allPassed = false;
    } catch (e) {
      console.error(`✗ Error fetching ${url}:`, e.message);
      allPassed = false;
    }
  }

  // Validate manifest JSON content
  const manifestRes = await fetch('http://localhost:4173/manifest.webmanifest');
  const manifest = await manifestRes.json();
  console.log('\n--- MANIFEST VALIDATION ---');
  console.log('Name:', manifest.name);
  console.log('Short Name:', manifest.short_name);
  console.log('Display:', manifest.display);
  console.log('Start URL:', manifest.start_url);
  console.log('Theme Color:', manifest.theme_color);
  console.log('Background Color:', manifest.background_color);
  console.log('Icons count:', manifest.icons.length);
  for (const icon of manifest.icons) {
    console.log(`  - ${icon.src} (${icon.sizes}, ${icon.type}, purpose: ${icon.purpose})`);
  }
  
  if (allPassed) {
    console.log('\n✓ ALL PWA ENDPOINTS AND ASSETS VERIFIED SUCCESSFULLY!');
  }
}

verifyEndpoints();
