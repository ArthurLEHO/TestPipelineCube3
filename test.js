// Tests simples pour le site web
const fs = require('fs');
const path = require('path');

console.log('🧪 Running tests...\n');

let passed = 0;
let failed = 0;

// Test 1: Vérifier que les fichiers existent
function testFilesExist() {
    const files = ['index.html', 'styles.css', 'script.js'];
    files.forEach(file => {
        if (fs.existsSync(path.join(__dirname, file))) {
            console.log(`✅ ${file} exists`);
            passed++;
        } else {
            console.log(`❌ ${file} missing`);
            failed++;
        }
    });
}

// Test 2: Vérifier le contenu HTML
function testHtmlContent() {
    const html = fs.readFileSync('index.html', 'utf8');
    
    if (html.includes('<!DOCTYPE html>')) {
        console.log('✅ HTML has DOCTYPE declaration');
        passed++;
    } else {
        console.log('❌ HTML missing DOCTYPE');
        failed++;
    }

    if (html.includes('<title>')) {
        console.log('✅ HTML has title tag');
        passed++;
    } else {
        console.log('❌ HTML missing title');
        failed++;
    }

    if (html.includes('script.js')) {
        console.log('✅ HTML links to JavaScript file');
        passed++;
    } else {
        console.log('❌ HTML missing JavaScript link');
        failed++;
    }

    if (html.includes('styles.css')) {
        console.log('✅ HTML links to CSS file');
        passed++;
    } else {
        console.log('❌ HTML missing CSS link');
        failed++;
    }
}

// Test 3: Vérifier le CSS
function testCssContent() {
    const css = fs.readFileSync('styles.css', 'utf8');
    
    if (css.includes('body')) {
        console.log('✅ CSS contains body styles');
        passed++;
    } else {
        console.log('❌ CSS missing body styles');
        failed++;
    }
}

// Test 4: Vérifier le JavaScript
function testJsContent() {
    const js = fs.readFileSync('script.js', 'utf8');
    
    if (js.includes('document.addEventListener')) {
        console.log('✅ JavaScript has event listeners');
        passed++;
    } else {
        console.log('❌ JavaScript missing event listeners');
        failed++;
    }
}

// Exécution des tests
try {
    testFilesExist();
    testHtmlContent();
    testCssContent();
    testJsContent();

    console.log(`\n📊 Results: ${passed} passed, ${failed} failed`);
    
    if (failed > 0) {
        process.exit(1);
    }
} catch (error) {
    console.error('❌ Test error:', error.message);
    process.exit(1);
}
