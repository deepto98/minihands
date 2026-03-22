import { screen, Region } from '@nut-tree-fork/nut-js';

async function test() {
  try {
    const w = await screen.width();
    const h = await screen.height();
    console.log(`Screen dimensions: ${w}x${h}`);
    console.log('Attempting Region grab...');
    const r = new Region(0, 0, w, h);
    const img = await screen.grab();
    console.log('Grab success! Object keys:', Object.keys(img));
  } catch (e) {
    console.error('Error caught in Node:', e);
  }
}
test();
