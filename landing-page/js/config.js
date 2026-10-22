/**
 * PD Link landing — ค่าที่ปรับได้ทั้งหมดอยู่ในไฟล์นี้
 *
 * "p" = ความคืบหน้าการเลื่อน 0 → 1 (0 = บนสุด, 1 = ล่างสุด)
 * ค่าที่เป็น range [a, b] คือช่วง p ที่เอฟเฟกต์นั้นเกิดขึ้น
 */
window.PDL_CONFIG = {

  /* ---------- 1. สี ---------- */
  colors: {
    background: '#0a0a0a',
    dot: 'rgba(255,255,255,0.26)',   // จุดบนพื้นหลัง
    dotGapPx: 48,                     // ระยะห่างระหว่างจุด
    accent: '#DE532E',                // pin, quote, progress bar, ปุ่ม CTA
    link: '#ffffff'                   // เส้นเชื่อมระหว่าง pin
  },

  /* ---------- 2. การเลื่อน ---------- */
  scroll: {
    trackHeightPx: 4200               // ยิ่งมาก = เลื่อนนานขึ้น (ทุกฉากช้าลงตามสัดส่วน)
  },

  /* ---------- 3. กล้อง 3D ---------- */
  camera: {
    perspectivePx: 1100,              // น้อย = มุมมองเกินจริง (fisheye) มาก, มาก = แบนลง
    eyeY: 0.22                        // ตำแหน่งสายตาแนวตั้ง (สัดส่วนของความสูงจอ)
  },

  /* ---------- 4. แผนที่ ---------- */
  map: {
    desktop: { widthRatio: 0.6, maxWidthPx: 760 },
    mobile:  { widthRatio: 0.96, maxWidthPx: 540 },
    mobileBreakpointPx: 760,
    provinceLines: { range: [0.30, 0.55], maxOpacity: 0.6 }  // เส้นแบ่งจังหวัดค่อยๆ ชัด
  },

  /* ---------- 5. มุมเอียง / ซูม / แพน ---------- */
  tilt: {
    startDeg: 5,                      // องศาจากแนวนอนตอนเริ่ม (90 = ตั้งตรงกับจอ)
    range: [0.25, 0.55]               // ช่วงที่แผนที่เงยขึ้นจนตรงจอ
  },
  zoom: {
    start: 1.55,                      // ขนาดเริ่มต้น (1 = ขนาดปกติ)
    extra: 0.7,                       // ซูมเข้าเพิ่มระหว่างเลื่อน (ก่อนเอียง)
    range: [0.04, 0.30]
  },
  pan: {
    heroPivotY: { desktop: 0.93, mobile: 0.90 }, // จุดกึ่งกลางแผนที่อยู่ที่ความสูงเท่าไรของจอตอนเริ่ม
    flatTopY: 0.10,                   // ขอบบนของแผนที่เมื่อเอียงเสร็จ
    endBottomY: 0.96,                 // ขอบล่างของแผนที่ตอนจบ
    range: [0.55, 0.88],              // ช่วงที่แผนที่เลื่อนไปภาคใต้
    shiftX: -0.17,                    // เลื่อนแผนที่ไปซ้ายเพื่อเว้นที่ให้ quote (สัดส่วนความกว้างจอ, desktop)
    shiftRange: [0.60, 0.70]
  },

  /* ---------- 6. Pin ---------- */
  pins: {
    startAt: 0.015,                   // pin แรกเด้งขึ้นที่ p นี้
    stagger: 0.035,                   // ระยะห่างระหว่างแต่ละ pin
    sizeRatio: 0.052,                 // ขนาด pin เทียบกับความกว้างแผนที่
    minSizePx: 26,
    maxSizePx: 44,
    labels: { range: [0.40, 0.50] }   // ป้ายชื่อจังหวัดค่อยๆ ขึ้น
  },

  /* ---------- 7. เส้นเชื่อม ---------- */
  links: {
    startAt: 0.42,
    stagger: 0.02,                    // เส้นถัดไปเริ่มหลังเส้นก่อนเท่าไร
    duration: 0.08,                   // ระยะ p ที่ใช้วาดหนึ่งเส้น
    bend: 0.16,                       // ความโค้ง (0 = เส้นตรง)
    opacity: 0.85,
    strokeWidth: 2.6                  // หน่วย viewBox ของแผนที่ (กว้าง 1040)
  },

  /* ---------- 8. ข้อความ / ปุ่ม ---------- */
  hero:  { fadeRange: [0.08, 0.22], liftPx: 70 },
  hint:  { fadeRange: [0.00, 0.04] },
  quote: { range: [0.60, 0.74], risePx: 30 },
  cta: {
    range: [0.83, 0.95],
    risePx: 24,
    // url: '',
    url: 'https://portal-sandbox-dev.pdlink.or.th/',
    showUrl: true
  },

  /* ---------- 9. Motion / easing ---------- */
  motion: {
    slowOutPower: 5,                  // ease-out ที่ผูกกับการเลื่อน: มาก = ช่วงแรกเร็วขึ้น
    cssEaseOut: 'cubic-bezier(0.05, 0.9, 0.1, 1)', // ใช้กับ fade (ช่วงแรกเร็ว จบช้า)
    cssEasePop: 'cubic-bezier(0.34, 1.7, 0.64, 1)', // ใช้กับ pin pop (เด้งเกินแล้วกลับ)
    fadeMs: 900,
    popMs: 600
  },

  /* ---------- 10. จังหวัด ----------
   * ใส่ได้ 2 แบบ: { lat, lon } (แนะนำ) หรือ { x, y } เป็น % ของกรอบแผนที่
   * ลำดับใน array = ลำดับที่ pin เด้งขึ้น
   */
  provinces: [
    { id: 'chiangrai',   label: 'เชียงราย',       lat: 19.91, lon: 99.84 },
    { id: 'khonkaen',    label: 'ขอนแก่น',        lat: 16.43, lon: 102.83 },
    { id: 'bangkok',     label: 'กรุงเทพมหานคร',  lat: 13.75, lon: 100.50 },
    { id: 'nakhonsawan', label: 'นครสวรรค์',      lat: 15.70, lon: 100.12 },
    { id: 'phuket',      label: 'ภูเก็ต',          lat: 7.88,  lon: 98.39 },
    { id: 'ubon',        label: 'อุบลราชธานี',    lat: 15.24, lon: 104.85 },
    { id: 'songkhla',    label: 'สงขลา',          lat: 7.19,  lon: 100.59 }
  ],

  /* คู่ที่เชื่อมกัน (ใช้ id) — แต่ละจังหวัด 2–3 เส้น */
  connections: [
    ['chiangrai', 'khonkaen'],
    ['chiangrai', 'nakhonsawan'],
    ['nakhonsawan', 'khonkaen'],
    ['khonkaen', 'ubon'],
    ['nakhonsawan', 'bangkok'],
    ['bangkok', 'phuket'],
    ['bangkok', 'songkhla'],
    ['phuket', 'songkhla'],
    ['ubon', 'songkhla']
  ]
};
