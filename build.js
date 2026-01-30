// Script de build simple pour le site web statique
const fs = require('fs');
const path = require('path');

console.log('🔨 Building website...\n');

// Créer le dossier dist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir);
    console.log('✅ Created dist directory');
}

// Copier les fichiers
const files = ['index.html', 'styles.css', 'script.js'];

files.forEach(file => {
    const src = path.join(__dirname, file);
    const dest = path.join(distDir, file);
    
    if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
        console.log(`✅ Copied ${file} to dist/`);
    } else {
        console.log(`❌ ${file} not found`);
        process.exit(1);
    }
});

// Créer un fichier build.json avec les métadonnées
const buildInfo = {
    version: '1.0.0',
    buildTime: new Date().toISOString(),
    environment: process.env.CI_ENVIRONMENT || process.env.GITHUB_ENV || 'development',
    commit: process.env.CI_COMMIT_SHORT_SHA || process.env.GITHUB_SHA?.substring(0, 7) || 'local'
};

fs.writeFileSync(
    path.join(distDir, 'build.json'),
    JSON.stringify(buildInfo, null, 2)
);

console.log('✅ Created build.json');
console.log('\n📦 Build complete!');
console.log(`📁 Output: ${distDir}/`);
console.log(`\nBuild info:`);
console.log(JSON.stringify(buildInfo, null, 2));
