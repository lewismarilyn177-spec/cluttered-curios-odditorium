export function propCenter(scene, i) {
  const p = scene.props[i];
  if (!p) return { x: 0, y: 0, r: 0 };
  const { x, y, w, h } = p;
  return { x: x + w / 2, y: y + h / 2, r: Math.max(w, h) / 2 };
}

function hsl(h, s, l, a = 1) {
  const hh = Number.isFinite(Number(h)) ? Number(h) : 0;
  return `hsla(${hh % 360}, ${s}%, ${l}%, ${a})`;
}

function drawChalk(ctx, fillStyle, strokeStyle, lineWidth = 2, fn) {
  ctx.save();
  fn(ctx);
  if (fillStyle) {
    ctx.fillStyle = fillStyle;
    ctx.fill();
  }
  if (strokeStyle) {
    ctx.strokeStyle = strokeStyle;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
  ctx.restore();
}

function drawEllipse(ctx, x, y, rx, ry, rotation = 0) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, rotation, 0, Math.PI * 2);
}

function drawRect(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
}

function drawRoundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function drawPolygon(ctx, points) {
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(points[i].x, points[i].y);
  }
  ctx.closePath();
}

function drawStar(ctx, cx, cy, spikes, outerR, innerR) {
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / spikes - Math.PI / 2;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

function drawBolt(ctx, cx, cy, size) {
  ctx.beginPath();
  ctx.moveTo(cx, cy - size);
  ctx.lineTo(cx - size * 0.3, cy - size * 0.3);
  ctx.lineTo(cx + size * 0.1, cy - size * 0.3);
  ctx.lineTo(cx - size * 0.2, cy + size * 0.5);
  ctx.lineTo(cx + size * 0.3, cy + size * 0.3);
  ctx.lineTo(cx - size * 0.1, cy + size * 0.3);
  ctx.lineTo(cx, cy - size);
  ctx.closePath();
}

function drawGear(ctx, cx, cy, outerR, innerR, teeth) {
  ctx.beginPath();
  for (let i = 0; i < teeth * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = (i * Math.PI) / teeth;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
  }
  ctx.closePath();
}

export function paintScene(ctx, scene, w, h, mutatedProps = new Set(), phase = 0) {
  const scaleX = w / 1000;
  const scaleY = h / 600;
  const scale = Math.min(scaleX, scaleY);
  const offsetX = (w - 1000 * scale) / 2;
  const offsetY = (h - 600 * scale) / 2;

  ctx.save();
  ctx.translate(offsetX, offsetY);
  ctx.scale(scale, scale);

  drawBackground(ctx, scene);
  drawFloor(ctx, scene);
  drawTrim(ctx, scene);

  const diffsByProp = new Map();
  if (scene.diffs) {
    for (const d of scene.diffs) {
      if (!diffsByProp.has(d.prop)) diffsByProp.set(d.prop, []);
      diffsByProp.get(d.prop).push(d);
    }
  }

  for (let i = 0; i < scene.props.length; i++) {
    const prop = scene.props[i];
    if (!prop) continue;

    const diffs = diffsByProp.get(i) || [];
    let hidden = false;
    let hueShift = 0;
    let scaleMul = 1;
    let shiftX = 0;
    let shiftY = 0;
    let addDoodle = null;

    for (const d of diffs) {
      if (mutatedProps.has(i)) {
        switch (d.mutate.k) {
          case 'hide': hidden = true; break;
          case 'hue': hueShift += d.mutate.v; break;
          case 'scale': scaleMul *= d.mutate.v; break;
          case 'shift': shiftX += d.mutate.v[0] || 0; shiftY += d.mutate.v[1] || 0; break;
          case 'add': addDoodle = d.mutate.v; break;
        }
      }
    }

    if (hidden) continue;

    const baseHue = Number.isFinite(Number(prop.hue)) ? Number(prop.hue) : 0;
    const hue = (baseHue + hueShift) % 360;
    const sized = { ...prop, w: prop.w ?? 150 * (prop.s || 1), h: prop.h ?? 150 * (prop.s || 1) };

    ctx.save();
    ctx.translate(sized.x + sized.w / 2 + shiftX, sized.y + sized.h / 2 + shiftY);
    ctx.scale(scaleMul, scaleMul);
    ctx.translate(-sized.w / 2, -sized.h / 2);

    drawProp(ctx, sized, hue, phase);

    if (addDoodle && mutatedProps.has(i)) {
      drawDoodle(ctx, sized, addDoodle, hue);
    }

    ctx.restore();
  }

  ctx.restore();
}

function drawBackground(ctx, scene) {
  const { sky } = scene.bg;
  const grad = ctx.createLinearGradient(0, 0, 0, 600);
  grad.addColorStop(0, hsl(sky[0], 50, 15));
  grad.addColorStop(0.5, hsl(sky[0], 50, 20));
  grad.addColorStop(1, hsl(sky[1], 50, 25));
  drawChalk(ctx, grad, hsl(sky[0], 50, 5), 1, (c) => {
    drawRect(c, 0, 0, 1000, 600);
  });
}

function drawFloor(ctx, scene) {
  const { floor } = scene.bg;
  const y = 480;
  drawChalk(ctx, hsl(floor, 30, 20), hsl(floor, 30, 10), 2, (c) => {
    drawRect(c, 0, y, 1000, 120);
  });
  drawChalk(ctx, null, hsl(floor, 30, 5), 3, (c) => {
    c.beginPath();
    c.moveTo(0, y);
    c.lineTo(1000, y);
  });
}

function drawTrim(ctx, scene) {
  const { trim } = scene.bg;
  drawChalk(ctx, hsl(trim, 20, 30), hsl(trim, 20, 15), 2, (c) => {
    c.beginPath();
    c.moveTo(0, 480);
    c.lineTo(1000, 480);
  });
  drawChalk(ctx, hsl(trim, 20, 25), hsl(trim, 20, 10), 2, (c) => {
    c.beginPath();
    c.moveTo(0, 320);
    c.lineTo(1000, 320);
  });
  for (let x = 50; x < 1000; x += 100) {
    drawChalk(ctx, null, hsl(trim, 20, 10), 1, (c) => {
      c.beginPath();
      c.moveTo(x, 320);
      c.lineTo(x, 480);
    });
  }
}

function drawProp(ctx, prop, hue, phase) {
  switch (prop.kind) {
    case 'shelf': drawShelf(ctx, prop, hue); break;
    case 'clock': drawClock(ctx, prop, hue, phase); break;
    case 'gears': drawGears(ctx, prop, hue, phase); break;
    case 'jars': drawJars(ctx, prop, hue); break;
    case 'cat': drawCat(ctx, prop, hue); break;
    case 'lamp': drawLamp(ctx, prop, hue, phase); break;
    case 'window': drawWindow(ctx, prop, hue); break;
    case 'plant': drawPlant(ctx, prop, hue); break;
    case 'books': drawBooks(ctx, prop, hue); break;
    case 'globe': drawGlobe(ctx, prop, hue); break;
    case 'tools': drawTools(ctx, prop, hue); break;
    case 'frame': drawFrame(ctx, prop, hue); break;
    case 'suitcase': drawSuitcase(ctx, prop, hue); break;
    case 'pipes': drawPipes(ctx, prop, hue); break;
    case 'rug': drawRug(ctx, prop, hue); break;
    case 'teapot': drawTeapot(ctx, prop, hue); break;
    case 'radio': drawRadio(ctx, prop, hue); break;
    case 'fishbowl': drawFishbowl(ctx, prop, hue); break;
    case 'telescope': drawTelescope(ctx, prop, hue); break;
    case 'chair': drawChair(ctx, prop, hue); break;
    case 'crate': drawCrate(ctx, prop, hue); break;
    case 'bell': drawBell(ctx, prop, hue); break;
  }
}

function drawShelf(ctx, p, hue) {
  const fill = hsl(hue, 30, 40);
  const stroke = hsl(hue, 30, 20);
  drawChalk(ctx, fill, stroke, 2, (c) => {
    drawRect(c, 0, p.h - 20, p.w, 20);
  });
  drawChalk(ctx, fill, stroke, 2, (c) => {
    drawRect(c, 10, 0, p.w - 20, 10);
  });
  for (let i = 0; i < 3; i++) {
    const x = 20 + i * (p.w - 40) / 2;
    drawChalk(ctx, hsl(hue + 30, 40, 50), hsl(hue + 30, 40, 30), 1.5, (c) => {
      drawRect(c, x - 8, -15, 16, 20);
    });
  }
}

function drawClock(ctx, p, hue, phase) {
  const cx = p.w / 2;
  const cy = p.h / 2;
  const r = Math.min(p.w, p.h) / 2 - 5;
  drawChalk(ctx, hsl(hue, 20, 90), hsl(hue, 20, 40), 3, (c) => drawEllipse(c, cx, cy, r, r));
  drawChalk(ctx, hsl(hue, 20, 95), hsl(hue, 20, 50), 1, (c) => drawEllipse(c, cx, cy, r - 8, r - 8));
  for (let i = 0; i < 12; i++) {
    const a = i * Math.PI / 6 - Math.PI / 2;
    const r1 = r - 12;
    const r2 = r - (i % 3 === 0 ? 20 : 16);
    drawChalk(ctx, null, hsl(hue, 20, 30), i % 3 === 0 ? 3 : 1.5, (c) => {
      c.beginPath();
      c.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      c.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    });
  }
  const pendulumAngle = Math.sin(phase * 0.8) * 0.15;
  drawChalk(ctx, null, hsl(hue, 20, 20), 4, (c) => {
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(cx + Math.sin(-Math.PI / 3 + pendulumAngle) * (r * 0.5), cy + Math.cos(-Math.PI / 3 + pendulumAngle) * (r * 0.5));
  });
  drawChalk(ctx, null, hsl(hue, 20, 20), 3, (c) => {
    c.beginPath();
    c.moveTo(cx, cy);
    c.lineTo(cx + Math.sin(Math.PI / 6 + pendulumAngle) * (r * 0.7), cy + Math.cos(Math.PI / 6 + pendulumAngle) * (r * 0.7));
  });
  drawChalk(ctx, hsl(hue, 20, 20), hsl(hue, 20, 10), 2, (c) => drawEllipse(c, cx, cy, 6, 6));
  drawChalk(ctx, null, hsl(hue, 20, 30), 2, (c) => {
    c.beginPath();
    c.moveTo(cx, cy + r * 0.9);
    c.lineTo(cx, cy + r * 1.3);
  });
  drawChalk(ctx, hsl(hue, 30, 40), hsl(hue, 30, 20), 2, (c) => drawEllipse(c, cx, cy + r * 1.3, 8, 4));
}

function drawGears(ctx, p, hue, phase) {
  const cx = p.w / 2;
  const cy = p.h / 2;
  const r = Math.min(p.w, p.h) / 2 - 5;
  const rot = phase * 0.3;
  drawChalk(ctx, hsl(hue, 20, 50), hsl(hue, 20, 25), 2, (c) => {
    c.save(); c.translate(cx, cy); c.rotate(rot); drawGear(c, 0, 0, r, r * 0.6, 12); c.restore();
  });
  drawChalk(ctx, hsl(hue, 20, 60), hsl(hue, 20, 30), 2, (c) => {
    c.save(); c.translate(cx - r * 0.8, cy); c.rotate(-rot * 0.9); drawGear(c, 0, 0, r * 0.7, r * 0.4, 10); c.restore();
  });
  drawChalk(ctx, hsl(hue, 20, 55), hsl(hue, 20, 28), 2, (c) => {
    c.save(); c.translate(cx + r * 0.8, cy); c.rotate(-rot * 0.9); drawGear(c, 0, 0, r * 0.7, r * 0.4, 10); c.restore();
  });
  drawChalk(ctx, hsl(hue, 20, 20), hsl(hue, 20, 10), 2, (c) => drawEllipse(c, cx, cy, 8, 8));
  drawChalk(ctx, hsl(hue, 20, 20), hsl(hue, 20, 10), 2, (c) => drawEllipse(c, cx - r * 0.8, cy, 6, 6));
  drawChalk(ctx, hsl(hue, 20, 20), hsl(hue, 20, 10), 2, (c) => drawEllipse(c, cx + r * 0.8, cy, 6, 6));
}

function drawJars(ctx, p, hue) {
  const count = 4;
  for (let i = 0; i < count; i++) {
    const x = 15 + i * (p.w - 30) / (count - 1);
    const y = p.h - 60;
    const w = 30;
    const h = 55;
    drawChalk(ctx, hsl(hue + i * 15, 40, 60), hsl(hue + i * 15, 40, 30), 2, (c) => {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x + w, y);
      c.bezierCurveTo(x + w, y - 10, x, y - 10, x, y);
      c.lineTo(x, y - h);
      c.bezierCurveTo(x, y - h - 8, x + w, y - h - 8, x + w, y - h);
      c.lineTo(x + w, y);
    });
    drawChalk(ctx, hsl(hue + i * 15, 30, 50), hsl(hue + i * 15, 30, 25), 2, (c) => {
      c.beginPath();
      c.moveTo(x, y - h);
      c.lineTo(x + w, y - h);
    });
    drawChalk(ctx, null, hsl(hue + i * 15, 40, 35), 1, (c) => {
      c.beginPath();
      c.moveTo(x + w / 2, y - h);
      c.lineTo(x + w / 2, y - h - 12);
    });
    drawChalk(ctx, hsl(hue + i * 15, 30, 40), hsl(hue + i * 15, 30, 20), 2, (c) => drawEllipse(c, x + w / 2, y - h - 12, 8, 4));
  }
}

function drawCat(ctx, p, hue) {
  const cx = p.w / 2;
  const cy = p.h - 40;
  const bodyW = 80;
  const bodyH = 50;
  drawChalk(ctx, hsl(hue, 30, 30), hsl(hue, 30, 15), 2, (c) => drawEllipse(c, cx, cy, bodyW / 2, bodyH / 2));
  drawChalk(ctx, hsl(hue, 30, 35), hsl(hue, 30, 18), 2, (c) => drawEllipse(c, cx + bodyW / 2 - 15, cy - bodyH / 2, 25, 25));
  drawChalk(ctx, hsl(hue + 20, 50, 60), hsl(hue + 20, 50, 40), 1.5, (c) => drawEllipse(c, cx + bodyW / 2 - 22, cy - bodyH / 2 - 3, 6, 5));
  drawChalk(ctx, hsl(hue + 20, 50, 60), hsl(hue + 20, 50, 40), 1.5, (c) => drawEllipse(c, cx + bodyW / 2 - 8, cy - bodyH / 2 - 3, 6, 5));
  drawChalk(ctx, hsl(0, 0, 10), hsl(0, 0, 5), 1, (c) => drawEllipse(c, cx + bodyW / 2 - 22, cy - bodyH / 2 - 3, 2, 3));
  drawChalk(ctx, hsl(0, 0, 10), hsl(0, 0, 5), 1, (c) => drawEllipse(c, cx + bodyW / 2 - 8, cy - bodyH / 2 - 3, 2, 3));
  drawChalk(ctx, hsl(hue, 30, 28), hsl(hue, 30, 12), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - bodyW / 2, cy);
    c.quadraticCurveTo(cx - bodyW / 2 - 40, cy - 20, cx - bodyW / 2 - 50, cy + 10);
    c.quadraticCurveTo(cx - bodyW / 2 - 30, cy + 15, cx - bodyW / 2, cy + 5);
  });
  drawChalk(ctx, hsl(hue, 30, 30), hsl(hue, 30, 15), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 25, cy + 15);
    c.lineTo(cx - 25, cy + 35);
  });
  drawChalk(ctx, hsl(hue, 30, 30), hsl(hue, 30, 15), 2, (c) => {
    c.beginPath();
    c.moveTo(cx + 15, cy + 15);
    c.lineTo(cx + 15, cy + 35);
  });
}

function drawLamp(ctx, p, hue, phase) {
  const cx = p.w / 2;
  const baseY = p.h - 20;
  const glowIntensity = 0.4 + 0.3 * Math.sin(phase * 1.2);
  drawChalk(ctx, hsl(hue, 20, 40), hsl(hue, 20, 20), 2, (c) => drawEllipse(c, cx, baseY, 30, 8));
  drawChalk(ctx, hsl(hue, 20, 50), hsl(hue, 20, 25), 3, (c) => {
    c.beginPath();
    c.moveTo(cx, baseY);
    c.lineTo(cx, baseY - 80);
  });
  drawChalk(ctx, hsl(hue + 40, 50, 70), hsl(hue + 40, 50, 45), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 40, baseY - 80);
    c.lineTo(cx + 40, baseY - 80);
    c.lineTo(cx + 30, baseY - 40);
    c.lineTo(cx - 30, baseY - 40);
    c.closePath();
  });
  const grad = ctx.createRadialGradient(cx, baseY - 60, 0, cx, baseY - 60, 50 * (1 + glowIntensity * 0.5));
  grad.addColorStop(0, hsl(hue + 40, 60, 90, 0.15 + glowIntensity * 0.25));
  grad.addColorStop(1, hsl(hue + 40, 60, 70, 0));
  drawChalk(ctx, grad, null, 1, (c) => drawEllipse(c, cx, baseY - 60, 50 * (1 + glowIntensity * 0.3), 30 * (1 + glowIntensity * 0.3)));
}

function drawWindow(ctx, p, hue) {
  const frameW = p.w;
  const frameH = p.h;
  drawChalk(ctx, hsl(hue, 20, 50), hsl(hue, 20, 25), 4, (c) => drawRect(c, 0, 0, frameW, frameH));
  drawChalk(ctx, hsl(220, 30, 20), hsl(220, 30, 10), 2, (c) => drawRect(c, 6, 6, frameW - 12, frameH - 12));
  drawChalk(ctx, hsl(45, 80, 70), hsl(45, 80, 50), 2, (c) => drawEllipse(c, frameW / 2, frameH / 2, frameW * 0.35, frameH * 0.35));
  drawChalk(ctx, null, hsl(45, 80, 60), 1, (c) => {
    c.beginPath();
    c.moveTo(frameW / 2, 6);
    c.lineTo(frameW / 2, frameH - 6);
  });
  drawChalk(ctx, null, hsl(45, 80, 60), 1, (c) => {
    c.beginPath();
    c.moveTo(6, frameH / 2);
    c.lineTo(frameW - 6, frameH / 2);
  });
}

function drawPlant(ctx, p, hue) {
  const cx = p.w / 2;
  const potY = p.h - 10;
  drawChalk(ctx, hsl(hue - 30, 30, 40), hsl(hue - 30, 30, 20), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 30, potY);
    c.lineTo(cx + 30, potY);
    c.lineTo(cx + 25, potY - 35);
    c.lineTo(cx - 25, potY - 35);
    c.closePath();
  });
  drawChalk(ctx, hsl(120, 40, 35), hsl(120, 40, 20), 3, (c) => {
    c.beginPath();
    c.moveTo(cx, potY - 35);
    c.lineTo(cx, potY - 100);
  });
  for (let i = 0; i < 5; i++) {
    const angle = (i - 2) * 0.4;
    const leafX = cx + Math.sin(angle) * 40;
    const leafY = potY - 50 - i * 10;
    drawChalk(ctx, hsl(120 + i * 5, 45, 40), hsl(120 + i * 5, 45, 25), 1.5, (c) => {
      c.beginPath();
      c.ellipse(cx, leafY, 25, 8, angle, 0, Math.PI * 2);
    });
  }
}

function drawBooks(ctx, p, hue) {
  const colors = [
    hsl(hue, 40, 50),
    hsl(hue + 60, 40, 50),
    hsl(hue + 120, 40, 50),
    hsl(hue + 180, 40, 50),
  ];
  const strokes = colors.map(c => c.replace(/[\d.]+\)$/, '25)'));
  for (let i = 0; i < 4; i++) {
    const y = p.h - 15 - i * 18;
    const tilt = (i - 1.5) * 0.1;
    drawChalk(ctx, colors[i], strokes[i], 2, (c) => {
      c.save();
      c.translate(p.w / 2, y);
      c.rotate(tilt);
      c.rect(-40, -12, 80, 16);
      c.restore();
    });
    drawChalk(ctx, null, strokes[i], 1, (c) => {
      c.beginPath();
      c.moveTo(p.w / 2 - 40, y);
      c.lineTo(p.w / 2 - 40, y - 12);
      c.moveTo(p.w / 2 + 40, y);
      c.lineTo(p.w / 2 + 40, y - 12);
    });
  }
}

function drawGlobe(ctx, p, hue) {
  const cx = p.w / 2;
  const cy = p.h / 2;
  const r = Math.min(p.w, p.h) / 2 - 5;
  drawChalk(ctx, hsl(hue, 50, 50), hsl(hue, 50, 25), 2, (c) => drawEllipse(c, cx, cy, r, r));
  drawChalk(ctx, null, hsl(200, 50, 40), 1.5, (c) => {
    c.beginPath();
    c.ellipse(cx, cy, r, r * 0.3, 0, 0, Math.PI * 2);
  });
  drawChalk(ctx, null, hsl(200, 50, 40), 1.5, (c) => {
    c.beginPath();
    c.ellipse(cx, cy, r * 0.3, r, 0, 0, Math.PI * 2);
  });
  drawChalk(ctx, hsl(hue - 40, 30, 40), hsl(hue - 40, 30, 20), 2, (c) => drawEllipse(c, cx, cy + r + 5, 20, 6));
  drawChalk(ctx, hsl(hue - 40, 30, 35), hsl(hue - 40, 30, 18), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 15, cy + r + 5);
    c.lineTo(cx + 15, cy + r + 5);
    c.lineTo(cx + 10, cy + r + 20);
    c.lineTo(cx - 10, cy + r + 20);
    c.closePath();
  });
}

function drawTools(ctx, p, hue) {
  drawChalk(ctx, hsl(hue, 20, 50), hsl(hue, 20, 25), 2, (c) => drawRect(c, 0, 0, p.w, p.h));
  for (let x = 15; x < p.w - 15; x += 25) {
    for (let y = 15; y < p.h - 15; y += 25) {
      drawChalk(ctx, hsl(hue, 20, 30), hsl(hue, 20, 15), 1.5, (c) => drawEllipse(c, x, y, 4, 4));
    }
  }
  const toolColors = [hsl(hue + 30, 50, 50), hsl(hue - 30, 50, 50), hsl(hue + 90, 50, 50)];
  for (let i = 0; i < 3; i++) {
    const x = 20 + i * 30;
    const y = p.h - 40;
    drawChalk(ctx, toolColors[i], toolColors[i].replace(/[\d.]+\)$/, '30)'), 2, (c) => {
      c.beginPath();
      c.moveTo(x, y);
      c.lineTo(x, y - 30);
      c.lineTo(x + 10, y - 30);
    });
  }
}

function drawFrame(ctx, p, hue) {
  drawChalk(ctx, hsl(hue, 30, 45), hsl(hue, 30, 20), 4, (c) => drawRect(c, 0, 0, p.w, p.h));
  drawChalk(ctx, hsl(hue + 180, 40, 60), hsl(hue + 180, 40, 35), 2, (c) => drawRect(c, 10, 10, p.w - 20, p.h - 20));
  drawChalk(ctx, hsl(hue + 180, 40, 60), hsl(hue + 180, 40, 35), 2, (c) => drawRect(c, 10, 10, p.w - 20, p.h - 20));
  drawChalk(ctx, hsl(hue, 40, 50), hsl(hue, 40, 25), 1.5, (c) => {
    c.beginPath();
    c.moveTo(20, 20);
    c.lineTo(p.w - 20, p.h - 20);
    c.moveTo(p.w - 20, 20);
    c.lineTo(20, p.h - 20);
  });
}

function drawSuitcase(ctx, p, hue) {
  drawChalk(ctx, hsl(hue, 40, 35), hsl(hue, 40, 15), 2, (c) => drawRoundedRect(c, 0, 0, p.w, p.h, 5));
  drawChalk(ctx, hsl(hue, 30, 30), hsl(hue, 30, 12), 2, (c) => {
    c.beginPath();
    c.moveTo(p.w / 2, 5);
    c.lineTo(p.w / 2, 25);
  });
  drawChalk(ctx, hsl(hue - 20, 20, 40), hsl(hue - 20, 20, 20), 2, (c) => {
    c.beginPath();
    c.moveTo(15, p.h / 2 - 10);
    c.lineTo(15, p.h / 2 + 10);
    c.lineTo(30, p.h / 2 + 10);
    c.lineTo(30, p.h / 2 - 10);
    c.closePath();
  });
  drawChalk(ctx, hsl(hue - 20, 20, 40), hsl(hue - 20, 20, 20), 2, (c) => {
    c.beginPath();
    c.moveTo(p.w - 15, p.h / 2 - 10);
    c.lineTo(p.w - 15, p.h / 2 + 10);
    c.lineTo(p.w - 30, p.h / 2 + 10);
    c.lineTo(p.w - 30, p.h / 2 - 10);
    c.closePath();
  });
  drawChalk(ctx, hsl(hue, 30, 25), hsl(hue, 30, 10), 1, (c) => {
    c.beginPath();
    c.moveTo(p.w / 2, 25);
    c.lineTo(p.w / 2, p.h - 5);
  });
}

function drawPipes(ctx, p, hue) {
  const pipeColor = hsl(hue, 20, 50);
  const pipeStroke = hsl(hue, 20, 25);
  drawChalk(ctx, pipeColor, pipeStroke, 3, (c) => {
    c.beginPath();
    c.moveTo(20, p.h - 10);
    c.lineTo(20, 20);
    c.lineTo(p.w - 20, 20);
    c.lineTo(p.w - 20, p.h - 10);
  });
  drawChalk(ctx, pipeColor, pipeStroke, 3, (c) => {
    c.beginPath();
    c.moveTo(60, p.h - 10);
    c.lineTo(60, 60);
  });
  drawChalk(ctx, pipeColor, pipeStroke, 3, (c) => {
    c.beginPath();
    c.moveTo(p.w - 60, p.h - 10);
    c.lineTo(p.w - 60, 60);
  });
  drawChalk(ctx, hsl(hue, 20, 40), hsl(hue, 20, 20), 2, (c) => drawEllipse(c, 20, 20, 12, 12));
  drawChalk(ctx, hsl(hue, 20, 40), hsl(hue, 20, 20), 2, (c) => drawEllipse(c, p.w - 20, 20, 12, 12));
  drawChalk(ctx, hsl(hue, 30, 35), hsl(hue, 30, 18), 2, (c) => {
    c.beginPath();
    c.moveTo(60, 60);
    c.arc(60, 60, 15, -Math.PI / 2, 0);
  });
  drawChalk(ctx, hsl(hue, 30, 35), hsl(hue, 30, 18), 2, (c) => {
    c.beginPath();
    c.moveTo(p.w - 60, 60);
    c.arc(p.w - 60, 60, 15, -Math.PI, -Math.PI / 2);
  });
}

function drawRug(ctx, p, hue) {
  drawChalk(ctx, hsl(hue, 40, 50), hsl(hue, 40, 25), 2, (c) => drawEllipse(c, p.w / 2, p.h / 2, p.w / 2 - 5, p.h / 2 - 5));
  for (let i = 0; i < 5; i++) {
    const y = p.h / 2 - 30 + i * 15;
    drawChalk(ctx, null, hsl(hue, 40, 35), 1, (c) => {
      c.beginPath();
      c.ellipse(p.w / 2, y, p.w / 2 - 15, 3, 0, 0, Math.PI * 2);
    });
  }
  for (let i = 0; i < 4; i++) {
    const x = p.w / 2 - 25 + i * 17;
    drawChalk(ctx, null, hsl(hue, 40, 35), 1, (c) => {
      c.beginPath();
      c.moveTo(x, p.h / 2 - 30);
      c.lineTo(x + 2, p.h / 2 + 30);
    });
  }
}

function drawTeapot(ctx, p, hue) {
  const cx = p.w / 2;
  const cy = p.h / 2 + 10;
  drawChalk(ctx, hsl(hue, 50, 55), hsl(hue, 50, 30), 2, (c) => drawEllipse(c, cx, cy, 35, 25));
  drawChalk(ctx, hsl(hue, 50, 55), hsl(hue, 50, 30), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 35, cy);
    c.quadraticCurveTo(cx - 50, cy - 10, cx - 40, cy - 30);
    c.quadraticCurveTo(cx - 30, cy - 35, cx - 20, cy - 30);
  });
  drawChalk(ctx, hsl(hue, 50, 55), hsl(hue, 50, 30), 2, (c) => {
    c.beginPath();
    c.moveTo(cx + 35, cy - 5);
    c.quadraticCurveTo(cx + 45, cy - 15, cx + 45, cy - 25);
    c.quadraticCurveTo(cx + 45, cy - 35, cx + 35, cy - 30);
  });
  drawChalk(ctx, hsl(hue, 50, 60), hsl(hue, 50, 35), 2, (c) => drawEllipse(c, cx, cy - 30, 12, 5));
  drawChalk(ctx, hsl(hue, 50, 50), hsl(hue, 50, 25), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 10, cy + 25);
    c.lineTo(cx + 10, cy + 25);
    c.lineTo(cx + 15, cy + 35);
    c.lineTo(cx - 15, cy + 35);
    c.closePath();
  });
}

function drawRadio(ctx, p, hue) {
  drawChalk(ctx, hsl(hue, 30, 40), hsl(hue, 30, 20), 2, (c) => drawRoundedRect(c, 0, 0, p.w, p.h, 5));
  drawChalk(ctx, hsl(hue + 180, 40, 30), hsl(hue + 180, 40, 15), 2, (c) => drawRect(c, 10, 10, p.w - 20, p.h * 0.5 - 10));
  drawChalk(ctx, hsl(hue, 40, 50), hsl(hue, 40, 25), 2, (c) => drawEllipse(c, p.w / 2, p.h * 0.7, 20, 12));
  drawChalk(ctx, hsl(hue, 40, 50), hsl(hue, 40, 25), 2, (c) => drawEllipse(c, p.w / 2, p.h * 0.7, 15, 8));
  drawChalk(ctx, hsl(hue, 40, 50), hsl(hue, 40, 25), 2, (c) => drawEllipse(c, p.w / 2, p.h * 0.85, 12, 12));
  drawChalk(ctx, hsl(hue, 40, 50), hsl(hue, 40, 25), 2, (c) => drawEllipse(c, p.w / 2, p.h * 0.85, 8, 8));
  drawChalk(ctx, hsl(hue, 20, 30), hsl(hue, 20, 15), 2, (c) => {
    c.beginPath();
    c.moveTo(p.w - 15, 15);
    c.lineTo(p.w - 15, 35);
  });
}

function drawFishbowl(ctx, p, hue) {
  const cx = p.w / 2;
  const cy = p.h / 2 + 10;
  const r = Math.min(p.w, p.h) / 2 - 10;
  drawChalk(ctx, hsl(200, 20, 85, 0.3), hsl(200, 30, 60), 2, (c) => drawEllipse(c, cx, cy, r, r * 0.9));
  drawChalk(ctx, hsl(200, 30, 60), hsl(200, 30, 40), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - r, cy);
    c.lineTo(cx + r, cy);
  });
  drawChalk(ctx, hsl(hue, 60, 55), hsl(hue, 60, 30), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 15, cy - 10);
    c.quadraticCurveTo(cx, cy - 20, cx + 15, cy - 10);
    c.quadraticCurveTo(cx + 5, cy, cx + 15, cy + 10);
    c.quadraticCurveTo(cx, cy + 20, cx - 15, cy + 10);
    c.closePath();
  });
  drawChalk(ctx, hsl(0, 0, 10), hsl(0, 0, 5), 1, (c) => drawEllipse(c, cx - 5, cy - 12, 3, 3));
  drawChalk(ctx, hsl(hue, 60, 55), hsl(hue, 60, 30), 1.5, (c) => {
    c.beginPath();
    c.moveTo(cx + 20, cy + 5);
    c.lineTo(cx + 30, cy + 15);
  });
}

function drawTelescope(ctx, p, hue) {
  const cx = p.w / 2;
  const cy = p.h / 2;
  drawChalk(ctx, hsl(hue, 20, 50), hsl(hue, 20, 25), 4, (c) => {
    c.beginPath();
    c.moveTo(cx, cy + 50);
    c.lineTo(cx - 30, cy - 50);
    c.lineTo(cx + 30, cy - 50);
    c.closePath();
  });
  drawChalk(ctx, hsl(hue, 20, 55), hsl(hue, 20, 28), 3, (c) => drawEllipse(c, cx, cy - 50, 30, 8));
  drawChalk(ctx, hsl(hue, 20, 45), hsl(hue, 20, 22), 3, (c) => drawEllipse(c, cx, cy + 50, 40, 10));
  drawChalk(ctx, hsl(hue - 30, 40, 50), hsl(hue - 30, 40, 25), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 5, cy - 50);
    c.lineTo(cx - 5, cy - 70);
  });
  drawChalk(ctx, hsl(hue - 30, 40, 50), hsl(hue - 30, 40, 25), 2, (c) => drawEllipse(c, cx - 5, cy - 70, 10, 5));
  drawChalk(ctx, hsl(hue, 20, 40), hsl(hue, 20, 20), 3, (c) => {
    c.beginPath();
    c.moveTo(cx - 15, cy + 50);
    c.lineTo(cx - 30, cy + 80);
    c.moveTo(cx + 15, cy + 50);
    c.lineTo(cx + 30, cy + 80);
    c.moveTo(cx, cy + 50);
    c.lineTo(cx, cy + 80);
  });
}

function drawChair(ctx, p, hue) {
  const cx = p.w / 2;
  const seatY = p.h - 40;
  drawChalk(ctx, hsl(hue, 30, 40), hsl(hue, 30, 20), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 40, seatY);
    c.lineTo(cx + 40, seatY);
    c.lineTo(cx + 35, seatY - 10);
    c.lineTo(cx - 35, seatY - 10);
    c.closePath();
  });
  drawChalk(ctx, hsl(hue, 30, 45), hsl(hue, 30, 22), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 35, seatY - 10);
    c.lineTo(cx - 35, seatY - 60);
  });
  drawChalk(ctx, hsl(hue, 30, 45), hsl(hue, 30, 22), 2, (c) => {
    c.beginPath();
    c.moveTo(cx + 35, seatY - 10);
    c.lineTo(cx + 35, seatY - 60);
  });
  drawChalk(ctx, hsl(hue, 30, 45), hsl(hue, 30, 22), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 35, seatY - 60);
    c.lineTo(cx + 35, seatY - 60);
  });
  drawChalk(ctx, hsl(hue, 30, 45), hsl(hue, 30, 22), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 30, seatY - 60);
    c.lineTo(cx - 30, seatY - 35);
    c.moveTo(cx + 30, seatY - 60);
    c.lineTo(cx + 30, seatY - 35);
  });
  drawChalk(ctx, hsl(hue, 30, 40), hsl(hue, 30, 20), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 35, seatY);
    c.lineTo(cx - 45, seatY + 30);
    c.moveTo(cx + 35, seatY);
    c.lineTo(cx + 45, seatY + 30);
  });
}

function drawCrate(ctx, p, hue) {
  drawChalk(ctx, hsl(hue, 40, 50), hsl(hue, 40, 25), 2, (c) => drawRect(c, 0, 0, p.w, p.h));
  drawChalk(ctx, null, hsl(hue, 40, 30), 1, (c) => {
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(p.w, p.h);
    c.moveTo(p.w, 0);
    c.lineTo(0, p.h);
  });
  drawChalk(ctx, hsl(hue, 30, 35), hsl(hue, 30, 18), 2, (c) => {
    c.beginPath();
    c.moveTo(p.w / 2 - 10, 5);
    c.lineTo(p.w / 2 - 10, 25);
    c.lineTo(p.w / 2 + 10, 25);
    c.lineTo(p.w / 2 + 10, 5);
    c.closePath();
  });
  drawChalk(ctx, hsl(hue, 30, 35), hsl(hue, 30, 18), 2, (c) => {
    c.beginPath();
    c.moveTo(p.w / 2 - 10, p.h - 5);
    c.lineTo(p.w / 2 - 10, p.h - 25);
    c.lineTo(p.w / 2 + 10, p.h - 25);
    c.lineTo(p.w / 2 + 10, p.h - 5);
    c.closePath();
  });
}

function drawBell(ctx, p, hue) {
  const cx = p.w / 2;
  const cy = p.h / 2 + 10;
  drawChalk(ctx, hsl(hue, 50, 60), hsl(hue, 50, 35), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 30, cy - 30);
    c.quadraticCurveTo(cx - 35, cy - 20, cx - 35, cy);
    c.lineTo(cx - 35, cy + 20);
    c.quadraticCurveTo(cx, cy + 35, cx + 35, cy + 20);
    c.lineTo(cx + 35, cy);
    c.quadraticCurveTo(cx + 35, cy - 20, cx + 30, cy - 30);
    c.closePath();
  });
  drawChalk(ctx, hsl(hue, 50, 65), hsl(hue, 50, 40), 1.5, (c) => drawEllipse(c, cx, cy + 20, 15, 5));
  drawChalk(ctx, hsl(hue, 50, 70), hsl(hue, 50, 45), 2, (c) => drawEllipse(c, cx, cy + 30, 6, 6));
  drawChalk(ctx, hsl(hue - 30, 40, 50), hsl(hue - 30, 40, 25), 2, (c) => {
    c.beginPath();
    c.moveTo(cx - 5, cy - 30);
    c.lineTo(cx - 5, cy - 40);
  });
}

function drawDoodle(ctx, prop, type, hue) {
  const cx = prop.w / 2;
  const cy = -prop.h / 2 - 15;
  if (type === 'star') {
    drawChalk(ctx, hsl(hue + 60, 80, 70), hsl(hue + 60, 80, 40), 2, (c) => drawStar(c, cx, cy, 5, 10, 5));
  } else if (type === 'bolt') {
    drawChalk(ctx, hsl(hue + 60, 80, 70), hsl(hue + 60, 80, 40), 2, (c) => drawBolt(c, cx, cy, 12));
  }
}