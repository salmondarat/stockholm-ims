import puppeteer from 'puppeteer-core';

const url = process.env.URL || 'http://localhost:3001/';

let killer;
async function main() {
  const browser = await puppeteer.launch({
    headless: 'new',
    executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome',
    args: [
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
    ],
  });
  const page = await browser.newPage();
  console.log('Opened new page');

  const messages = [];
  page.on('console', (msg) => {
    messages.push({ type: msg.type(), text: msg.text() });
  });
  page.on('pageerror', (err) => {
    messages.push({ type: 'error', text: `PageError: ${err.message}` });
  });

  console.log('Navigating to', url);
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  console.log('DOM content loaded');
  // Give Next.js dev hooks a moment to attach
  await new Promise((r) => setTimeout(r, 1500));

  // Filter to only error/warning-level items
  const issues = messages.filter((m) => m.type === 'error' || m.type === 'warning');
  if (issues.length) {
    console.log('Console issues found:');
    for (const m of issues) {
      console.log(`[${m.type}] ${m.text}`);
    }
    await browser.close();
    clearTimeout(killer);
    process.exitCode = 1;
    return;
  }

  console.log('No console errors or warnings detected.');
  await browser.close();
  clearTimeout(killer);
}

main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});

// Safety: hard timeout so CI doesn't hang
killer = setTimeout(() => {
  console.error('Timed out waiting for page, exiting.');
  process.exit(2);
}, 20000);
