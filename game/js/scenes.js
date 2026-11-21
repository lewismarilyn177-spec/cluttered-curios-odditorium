export const DIFF_COUNTS = [6, 7, 8, 9, 10];

export const SCENES = [
  {
    id: 'clockmaker-attic',
    title: "The Clockmaker's Attic",
    blurb: 'Dust motes dance through shafts of moonlight as a thousand timepieces tick in uneven harmony. Somewhere, a mainspring has slipped.',
    bg: { sky: ['#1a162e', '#0d0a1a'], floor: '#2a243e' },
    props: [
      { kind: 'shelf', x: 80, y: 180, s: 1.2, hue: 30 },
      { kind: 'shelf', x: 80, y: 300, s: 1.2, hue: 30 },
      { kind: 'shelf', x: 880, y: 180, s: 1.2, hue: 30 },
      { kind: 'clock', x: 180, y: 160, s: 0.8, hue: 25 },
      { kind: 'clock', x: 820, y: 160, s: 0.7, hue: 25 },
      { kind: 'gears', x: 280, y: 220, s: 0.6, hue: 40 },
      { kind: 'gears', x: 720, y: 220, s: 0.5, hue: 40 },
      { kind: 'tools', x: 120, y: 480, s: 0.7, hue: 35 },
      { kind: 'books', x: 900, y: 460, s: 0.8, hue: 20 },
      { kind: 'frame', x: 500, y: 140, s: 0.9, hue: 15 },
      { kind: 'lamp', x: 50, y: 500, s: 0.6, hue: 45 },
      { kind: 'suitcase', x: 930, y: 490, s: 0.5, hue: 28 },
      { kind: 'cat', x: 400, y: 520, s: 0.5, hue: 0 },
      { kind: 'rug', x: 350, y: 540, s: 1.5, hue: 320 }
    ],
    diffs: [
      { id: 'd1', label: "A gear went missing", prop: 5, mutate: { k: 'hide', v: true }, cx: 280, cy: 220, r: 40 },
      { id: 'd2', label: "The cat's eyes changed color", prop: 12, mutate: { k: 'hue', v: 180 }, cx: 400, cy: 520, r: 38 },
      { id: 'd3', label: "One clock lost its hands", prop: 3, mutate: { k: 'hue', v: 90 }, cx: 180, cy: 160, r: 42 },
      { id: 'd4', label: "A book grew twice as thick", prop: 8, mutate: { k: 'scale', v: 2.0 }, cx: 900, cy: 460, r: 36 },
      { id: 'd5', label: "The lamp shifted left", prop: 10, mutate: { k: 'shift', v: 80 }, cx: 130, cy: 500, r: 40 },
      { id: 'd6', label: "A tiny gear appeared on the floor", prop: 6, mutate: { k: 'add', v: 'gear' }, cx: 720, cy: 560, r: 38 }
    ]
  },
  {
    id: 'glasshouse-conservatory',
    title: 'The Glasshouse Conservatory',
    blurb: 'Exotic flora press against curved panes, their leaves breathing in the night air. A single orchid has bloomed in a new shade.',
    bg: { sky: ['#0f2a2e', '#08181a'], floor: '#1a3a3e' },
    props: [
      { kind: 'window', x: 100, y: 80, s: 1.5, hue: 200 },
      { kind: 'window', x: 500, y: 80, s: 1.5, hue: 200 },
      { kind: 'window', x: 900, y: 80, s: 1.5, hue: 200 },
      { kind: 'plant', x: 150, y: 380, s: 1.0, hue: 120 },
      { kind: 'plant', x: 350, y: 400, s: 0.9, hue: 100 },
      { kind: 'plant', x: 550, y: 390, s: 1.1, hue: 140 },
      { kind: 'plant', x: 750, y: 380, s: 0.8, hue: 110 },
      { kind: 'plant', x: 920, y: 400, s: 0.9, hue: 130 },
      { kind: 'jars', x: 80, y: 460, s: 0.7, hue: 50 },
      { kind: 'jars', x: 900, y: 470, s: 0.6, hue: 50 },
      { kind: 'teapot', x: 480, y: 500, s: 0.5, hue: 30 },
      { kind: 'chair', x: 200, y: 520, s: 0.8, hue: 25 },
      { kind: 'rug', x: 300, y: 540, s: 1.3, hue: 340 }
    ],
    diffs: [
      { id: 'd1', label: "An orchid turned blue", prop: 3, mutate: { k: 'hue', v: 200 }, cx: 150, cy: 380, r: 40 },
      { id: 'd2', label: "A jar vanished from the shelf", prop: 8, mutate: { k: 'hide', v: true }, cx: 80, cy: 460, r: 38 },
      { id: 'd3', label: "The teapot grew a spout", prop: 10, mutate: { k: 'add', v: 'spout' }, cx: 480, cy: 500, r: 36 },
      { id: 'd4', label: "A fern doubled in size", prop: 5, mutate: { k: 'scale', v: 2.0 }, cx: 350, cy: 400, r: 42 },
      { id: 'd5', label: "The chair slid backward", prop: 11, mutate: { k: 'shift', v: -60 }, cx: 140, cy: 520, r: 40 },
      { id: 'd6', label: "A new sprout emerged", prop: 6, mutate: { k: 'add', v: 'sprout' }, cx: 550, cy: 390, r: 38 },
      { id: 'd7', label: "Glass pane cracked subtly", prop: 1, mutate: { k: 'hue', v: 45 }, cx: 500, cy: 80, r: 44 }
    ]
  },
  {
    id: 'divers-galley',
    title: "The Diver's Galley",
    blurb: 'Salt-crusted brass and copper pipes snake through portholes. The smell of brine lingers where a mess table once held charts.',
    bg: { sky: ['#0d1b2a', '#06101a'], floor: '#1a2a3a' },
    props: [
      { kind: 'window', x: 150, y: 120, s: 0.8, hue: 200 },
      { kind: 'window', x: 850, y: 120, s: 0.8, hue: 200 },
      { kind: 'pipes', x: 50, y: 200, s: 1.0, hue: 30 },
      { kind: 'pipes', x: 950, y: 200, s: 1.0, hue: 30 },
      { kind: 'fishbowl', x: 200, y: 350, s: 0.7, hue: 180 },
      { kind: 'globe', x: 800, y: 340, s: 0.8, hue: 220 },
      { kind: 'crate', x: 100, y: 480, s: 0.9, hue: 25 },
      { kind: 'crate', x: 900, y: 490, s: 0.8, hue: 25 },
      { kind: 'radio', x: 450, y: 460, s: 0.6, hue: 350 },
      { kind: 'bell', x: 550, y: 440, s: 0.5, hue: 45 },
      { kind: 'tools', x: 300, y: 500, s: 0.7, hue: 40 },
      { kind: 'suitcase', x: 700, y: 510, s: 0.6, hue: 30 },
      { kind: 'rug', x: 400, y: 540, s: 1.2, hue: 20 },
      { kind: 'frame', x: 500, y: 100, s: 0.7, hue: 10 }
    ],
    diffs: [
      { id: 'd1', label: "The fishbowl emptied out", prop: 4, mutate: { k: 'hide', v: true }, cx: 200, cy: 350, r: 40 },
      { id: 'd2', label: "Globe spun to a new land", prop: 5, mutate: { k: 'hue', v: 120 }, cx: 800, cy: 340, r: 42 },
      { id: 'd3', label: "A crate shrank by half", prop: 6, mutate: { k: 'scale', v: 0.5 }, cx: 100, cy: 480, r: 38 },
      { id: 'd4', label: "The bell rang louder", prop: 9, mutate: { k: 'scale', v: 1.5 }, cx: 550, cy: 440, r: 36 },
      { id: 'd5', label: "Radio dial turned red", prop: 8, mutate: { k: 'hue', v: 0 }, cx: 450, cy: 460, r: 40 },
      { id: 'd6', label: "Tools slid across the deck", prop: 10, mutate: { k: 'shift', v: 100 }, cx: 400, cy: 500, r: 42 },
      { id: 'd7', label: "A barnacle grew on the pipe", prop: 2, mutate: { k: 'add', v: 'barnacle' }, cx: 50, cy: 550, r: 38 },
      { id: 'd8', label: "Suitcase latch flipped open", prop: 11, mutate: { k: 'add', v: 'latch' }, cx: 700, cy: 510, r: 36 }
    ]
  },
  {
    id: 'rooftop-observatory',
    title: 'The Rooftop Observatory',
    blurb: 'The dome yawns open to a sky thick with stars. Lenses whisper as they track a comet that was not there yesterday.',
    bg: { sky: ['#0a0a2e', '#03031a'], floor: '#1a1a3a' },
    props: [
      { kind: 'telescope', x: 500, y: 200, s: 1.5, hue: 240 },
      { kind: 'window', x: 100, y: 80, s: 1.0, hue: 220 },
      { kind: 'window', x: 900, y: 80, s: 1.0, hue: 220 },
      { kind: 'globe', x: 200, y: 380, s: 0.9, hue: 200 },
      { kind: 'books', x: 800, y: 370, s: 0.8, hue: 260 },
      { kind: 'chair', x: 350, y: 500, s: 0.8, hue: 240 },
      { kind: 'lamp', x: 650, y: 480, s: 0.7, hue: 40 },
      { kind: 'frame', x: 150, y: 120, s: 0.6, hue: 280 },
      { kind: 'frame', x: 850, y: 120, s: 0.6, hue: 280 },
      { kind: 'rug', x: 400, y: 540, s: 1.3, hue: 300 },
      { kind: 'clock', x: 50, y: 460, s: 0.6, hue: 250 },
      { kind: 'crate', x: 930, y: 500, s: 0.5, hue: 260 },
      { kind: 'cat', x: 480, y: 520, s: 0.4, hue: 30 }
    ],
    diffs: [
      { id: 'd1', label: "Telescope aimed at new star", prop: 0, mutate: { k: 'hue', v: 60 }, cx: 500, cy: 200, r: 44 },
      { id: 'd2', label: "A star chart disappeared", prop: 4, mutate: { k: 'hide', v: true }, cx: 800, cy: 370, r: 40 },
      { id: 'd3', label: "The globe shows Mars now", prop: 3, mutate: { k: 'hue', v: 180 }, cx: 200, cy: 380, r: 42 },
      { id: 'd4', label: "Cat grew a white patch", prop: 12, mutate: { k: 'add', v: 'patch' }, cx: 480, cy: 520, r: 36 },
      { id: 'd5', label: "Lamp light turned cold", prop: 6, mutate: { k: 'hue', v: 200 }, cx: 650, cy: 480, r: 38 },
      { id: 'd6', label: "Clock hands froze at midnight", prop: 10, mutate: { k: 'scale', v: 0.8 }, cx: 50, cy: 460, r: 40 },
      { id: 'd7', label: "Chair rotated toward window", prop: 5, mutate: { k: 'shift', v: -80 }, cx: 270, cy: 500, r: 42 },
      { id: 'd8', label: "A meteor streak appeared", prop: 0, mutate: { k: 'add', v: 'meteor' }, cx: 500, cy: 150, r: 38 },
      { id: 'd9', label: "Frame now shows a nebula", prop: 7, mutate: { k: 'hue', v: 300 }, cx: 150, cy: 120, r: 36 }
    ]
  },
  {
    id: 'midnight-diner',
    title: 'The Midnight Diner',
    blurb: 'Neon hums through rain-slick windows. Coffee steams in chipped mugs while the jukebox plays a song no one selected.',
    bg: { sky: ['#2a0a1a', '#1a0510'], floor: '#3a1a2a' },
    props: [
      { kind: 'window', x: 100, y: 60, s: 1.2, hue: 340 },
      { kind: 'window', x: 500, y: 60, s: 1.2, hue: 340 },
      { kind: 'window', x: 900, y: 60, s: 1.2, hue: 340 },
      { kind: 'lamp', x: 200, y: 400, s: 0.8, hue: 30 },
      { kind: 'lamp', x: 800, y: 400, s: 0.8, hue: 30 },
      { kind: 'radio', x: 500, y: 380, s: 0.9, hue: 5 },
      { kind: 'teapot', x: 300, y: 450, s: 0.6, hue: 350 },
      { kind: 'books', x: 700, y: 440, s: 0.5, hue: 10 },
      { kind: 'chair', x: 150, y: 500, s: 0.7, hue: 350 },
      { kind: 'chair', x: 850, y: 500, s: 0.7, hue: 350 },
      { kind: 'cat', x: 400, y: 530, s: 0.4, hue: 0 },
      { kind: 'rug', x: 350, y: 540, s: 1.4, hue: 320 },
      { kind: 'clock', x: 950, y: 350, s: 0.5, hue: 355 },
      { kind: 'suitcase', x: 50, y: 480, s: 0.5, hue: 20 }
    ],
    diffs: [
      { id: 'd1', label: "Neon sign flickered pink", prop: 0, mutate: { k: 'hue', v: 300 }, cx: 100, cy: 60, r: 42 },
      { id: 'd2', label: "Coffee cup materialized", prop: 6, mutate: { k: 'add', v: 'cup' }, cx: 300, cy: 450, r: 36 },
      { id: 'd3', label: "Radio dial went silent", prop: 5, mutate: { k: 'hide', v: true }, cx: 500, cy: 380, r: 40 },
      { id: 'd4', label: "Cat curled the other way", prop: 10, mutate: { k: 'hue', v: 180 }, cx: 400, cy: 530, r: 38 },
      { id: 'd5', label: "Left lamp dimmed to amber", prop: 3, mutate: { k: 'hue', v: 30 }, cx: 200, cy: 400, r: 40 },
      { id: 'd6', label: "Chair scraped backward", prop: 8, mutate: { k: 'shift', v: -70 }, cx: 80, cy: 500, r: 42 },
      { id: 'd7', label: "Clock ran backwards", prop: 12, mutate: { k: 'scale', v: -1 }, cx: 950, cy: 350, r: 38 },
      { id: 'd8', label: "A page turned itself", prop: 7, mutate: { k: 'add', v: 'page' }, cx: 700, cy: 440, r: 36 },
      { id: 'd9', label: "Suitcase burst open", prop: 13, mutate: { k: 'add', v: 'clothes' }, cx: 50, cy: 480, r: 40 },
      { id: 'd10', label: "Right window fogged over", prop: 2, mutate: { k: 'hue', v: 180 }, cx: 900, cy: 60, r: 44 }
    ]
  }
];