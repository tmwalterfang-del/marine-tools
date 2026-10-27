/* Website-only acceptance against main. Never requests production APIs. */
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const pw = require('playwright');
const engine = process.argv[2] || 'chromium';
const root = path.resolve('.');
const out = path.join(root, 'qa-privacy-main', engine);
let server, browser;

(async () => {
  execFileSync(process.execPath, ['scripts/build-privacy.mjs', '--check']);
  fs.mkdirSync(out, {recursive: true});
  const fragment = fs.readFileSync('privacy/policy.fragment', 'utf8').trim();
  const errors = [], results = [];
  server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(root + path.sep)) return res.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
      if (!url.pathname.endsWith('/')) return res.writeHead(301, {Location: url.pathname + '/' + url.search}).end();
      file = path.join(file, 'index.html');
    }
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) return res.writeHead(404).end();
    res.setHeader('Content-Type', ({'.html': 'text/html;charset=utf-8', '.js': 'application/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.webmanifest': 'application/manifest+json'})[path.extname(file)] || 'application/octet-stream');
    res.end(fs.readFileSync(file));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  browser = await pw[engine].launch(process.env.MT_QA_BROWSER_PATH ? {executablePath: process.env.MT_QA_BROWSER_PATH} : {});
  for (const [width, height] of [[320,568], [568,320], [412,915], [915,412], [768,1024], [1024,768], [1366,768], [2560,1440]]) {
    const context = await browser.newContext({viewport: {width, height}, javaScriptEnabled: false, serviceWorkers: 'block'});
    const page = await context.newPage(), requests = [];
    page.on('request', r => requests.push(r.url()));
    const response = await page.goto(origin + '/privacy');
    assert.equal(response.status(), 200);
    assert(page.url().endsWith('/privacy/'));
    await page.getByRole('heading', {name: 'Marine Tools Privacy Policy', exact: true}).waitFor();
    assert.equal((await page.locator('main').innerHTML()).trim(), fragment);
    assert.equal(await page.locator('script,iframe,details,form').count(), 0);
    assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'), 'https://www.marinetools.app/privacy');
    assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    assert.equal((await page.reload()).status(), 200);
    if (width === 412) await page.screenshot({path: path.join(out, 'privacy-phone.png')});
    await page.getByRole('link', {name: 'Your rights', exact: true}).click();
    assert(page.url().endsWith('#rights'));
    await page.locator('#policy-changes').scrollIntoViewIfNeeded();
    assert(requests.every(url => url.startsWith(origin + '/')), 'Static policy requests only local assets');
    await page.screenshot({path: path.join(out, `privacy-${width}x${height}.png`), fullPage: true});
    results.push({width, height, javascript: false, status: 'PASS'});
    await context.close();
  }
  const context = await browser.newContext({viewport: {width: 1366, height: 768}, serviceWorkers: 'block', acceptDownloads: true});
  await context.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.fulfill({status: 200, contentType: 'application/json', body: '{}'}));
  // Seed once so reload checks really detect erased or changed preferences.
  await context.addInitScript(() => {
    if (!localStorage.getItem('privacy-test-seeded')) {
      localStorage.setItem('privacy-test-seeded', '1');
      localStorage.setItem('mt.analytics.exclude', '1');
      localStorage.setItem('mt.settings', JSON.stringify({usageAnalytics: false, privacySentinel: 'keep'}));
      localStorage.setItem('mt.profile', JSON.stringify({name: 'Retained vessel'}));
      localStorage.setItem('mt.lastSeenReleaseBuild', '20261019-v8-7-0');
    }
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/?page=privacy');
  await page.locator('#privacy .privacy-policy').waitFor();
  assert.equal((await page.locator('#privacy').innerHTML()).trim(), fragment);
  await page.reload();
  await page.locator('#privacy .privacy-policy').waitFor();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mt.profile')).name), 'Retained vessel');
  // Exercise existing navigation, opt-out control, backup and an independent calculation.
  const dialog = page.locator('#mtReleaseDialog[open] #mtReleaseDone');
  if (await dialog.count()) await dialog.click();
  await page.locator('[data-go=settings]').first().click();
  await page.locator('#exportData').waitFor();
  assert.equal(await page.locator('#setAnalytics').isChecked(), false);
  assert.equal(await page.locator('#excludeAnalytics').isChecked(), true);
  await page.locator('#setAnalytics').check();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('mt.settings')).usageAnalytics), true);
  await page.locator('#setAnalytics').uncheck();
  const downloadEvent = page.waitForEvent('download');
  await page.locator('#exportData').click();
  const download = await downloadEvent;
  const backup = JSON.parse(fs.readFileSync(await download.path(), 'utf8'));
  assert.equal(backup.profile.name, 'Retained vessel');
  assert.equal(backup.settings.privacySentinel, 'keep');
  assert.equal(backup.settings.usageAnalytics, false);
  await page.locator('.nav-list [data-page=vessel-calcs]').click();
  await page.locator('#calcAirDraft').click();
  assert.match(await page.locator('#resAirDraft').textContent(), /3.20 m/);
  await page.locator('#airMargin').fill('1.5');
  await page.locator('#calcAirDraft').click();
  assert.match(await page.locator('#resAirDraft').textContent(), /2.70 m/);
  assert.equal(errors.length, 0, errors.join('\n'));
  // Main's Education/professional links remain intact in this small integration.
  assert.equal(await page.locator('a[href="/education/"]').count(), 1);
  assert.equal(await page.locator('a[href="/professionals/"]').count(), 1);
  await context.close();
  const offlineContext = await browser.newContext({serviceWorkers: 'allow'});
  await offlineContext.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
  await offlineContext.addInitScript(() => localStorage.setItem('mt.analytics.exclude', '1'));
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(origin + '/');
  await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  await offlinePage.waitForFunction(() => !!navigator.serviceWorker.controller);
  await offlineContext.setOffline(true);
  await offlinePage.goto(origin + '/privacy');
  await offlinePage.getByRole('heading', {name: 'Marine Tools Privacy Policy', exact: true}).waitFor();
  assert.equal((await offlinePage.locator('main').innerHTML()).trim(), fragment);
  await offlinePage.reload();
  await offlinePage.locator('#policy-changes').scrollIntoViewIfNeeded();
  await offlineContext.close();
  fs.writeFileSync(path.join(out, 'results.json'), JSON.stringify({status: 'PASS', engine, profiles: results, settingsAndBackup: true, calculatorReference: true, policyOffline: true, productionVerified: false, physicalDevice: false}, null, 2));
  console.log(JSON.stringify({status: 'PASS', engine, profiles: results.length, settingsAndBackup: true, calculatorReference: true, policyOffline: true}));
})().catch(error => {console.error(error); process.exitCode = 1;}).finally(async () => {
  await browser?.close();
  server?.closeAllConnections();
  server?.close();
});
