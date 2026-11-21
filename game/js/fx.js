const SPARK_LIFE = 600;
const SPARK_COUNT = 12;

class Spark {
  constructor(x, y, angle, speed, color, born) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.speed = speed;
    this.color = color;
    this.born = born;
    this.len = 8 + Math.random() * 12;
  }

  update(now) {
    const age = now - this.born;
    const t = age / SPARK_LIFE;
    if (t >= 1) return false;
    this.x += Math.cos(this.angle) * this.speed * (1 - t);
    this.y += Math.sin(this.angle) * this.speed * (1 - t);
    return true;
  }

  draw(ctx, now) {
    const age = now - this.born;
    const t = age / SPARK_LIFE;
    const alpha = 1 - t;
    ctx.strokeStyle = this.color.replace(')', `, ${alpha})`).replace('rgb', 'rgba');
    ctx.lineWidth = 2 * (1 - t * 0.5);
    ctx.beginPath();
    ctx.moveTo(this.x, this.y);
    ctx.lineTo(
      this.x - Math.cos(this.angle) * this.len * (1 - t),
      this.y - Math.sin(this.angle) * this.len * (1 - t)
    );
    ctx.stroke();
  }
}

export class MarkerLayer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sparks = [];
    this.lastTime = 0;
  }

  draw(foundDiffs, pulseDiff, missFlash) {
    const now = performance.now();
    const ctx = this.ctx;
    const { width, height } = this.canvas;

    // the panel canvas already holds the freshly painted scene; do not clear it here

    if (this.lastTime) {
      this.sparks = this.sparks.filter(s => s && typeof s.update === 'function' && typeof s.draw === 'function' && s.update(now));
    }
    this.lastTime = now;

    foundDiffs.forEach(d => {
      const { x, y, r } = d;
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, r + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r + 8, 0, Math.PI * 2);
      ctx.stroke();
    });

    this.sparks.forEach(s => s.draw(ctx, now));

    if (pulseDiff) {
      const { x, y, r } = pulseDiff;
      const pulse = (Math.sin(now / 200) + 1) / 2;
      ctx.strokeStyle = `rgba(0, 200, 255, ${0.5 + pulse * 0.5})`;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 6]);
      ctx.lineDashOffset = -now / 50;
      ctx.beginPath();
      ctx.arc(x, y, r + 10 + pulse * 6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    if (missFlash && now - missFlash.time < 300) {
      const t = (now - missFlash.time) / 300;
      const { x, y } = missFlash;
      const size = 20;
      ctx.strokeStyle = `rgba(255, 60, 60, ${1 - t})`;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(x - size, y - size);
      ctx.lineTo(x + size, y + size);
      ctx.moveTo(x + size, y - size);
      ctx.lineTo(x - size, y + size);
      ctx.stroke();
    }
  }
}

export function spawnSparkles(ctx, x, y, t) {
  const colors = ['#ffd700', '#fff8dc', '#ffeb3b', '#fff'];
  for (let i = 0; i < SPARK_COUNT; i++) {
    const angle = (Math.PI * 2 / SPARK_COUNT) * i + Math.random() * 0.3;
    const speed = 60 + Math.random() * 80;
    const color = colors[Math.floor(Math.random() * colors.length)];
    ctx.sparks.push(new Spark(x, y, angle, speed, color, t));
  }
}