<!-- 
sudo rsync -a --delete --exclude README.md /home/ubuntu/apps/landing-page/ /var/www/pdlink-landing/
 -->

# PD Link — Landing page

Static site (HTML + CSS + vanilla JS) ไม่มี build step ไม่มี dependency

```
pdlink-landing/
├── index.html          โครงหน้า + ข้อความทั้งหมด (แก้ copy ที่นี่)
├── css/style.css       layout, responsive (<760px), easing ค่าเริ่มต้น
├── js/config.js        ★ ค่าที่ปรับได้ทั้งหมด (สี, เวลา, มุม, ซูม, จังหวัด, เส้นเชื่อม)
├── js/main.js          scroll engine (ไม่ต้องแก้)
└── assets/             แผนที่ SVG (เส้นขอบประเทศ, เส้นแบ่งจังหวัด), โลโก้
```

## รันในเครื่อง

ต้องเปิดผ่าน web server (เปิดไฟล์ตรงๆ บางเบราว์เซอร์จะไม่โหลด SVG):

```bash
cd pdlink-landing
python3 -m http.server 8080
# เปิด http://localhost:8080
```

## Deploy

เป็นไฟล์ static ทั้งหมด วางบนอะไรก็ได้: Nginx, S3/MinIO + CDN, GitHub Pages, Netlify

```nginx
server {
  listen 80;
  server_name www.pdlink.or.th;
  root /var/www/pdlink-landing;
  location ~* \.(svg|png|css|js)$ { expires 7d; add_header Cache-Control "public"; }
}
```

หรือ Docker:

```dockerfile
FROM nginx:1.27-alpine
COPY . /usr/share/nginx/html
```

## ปรับค่าที่ใช้บ่อย (js/config.js)

| อยากได้ | แก้ |
|---|---|
| เลื่อนเร็ว/ช้าลง | `scroll.trackHeightPx` |
| มุมเอียงเริ่มต้น | `tilt.startDeg` (5 = ราบเกือบขนานพื้น, 90 = ตรงจอ) |
| แผนที่ตอนเริ่มใหญ่ขึ้น | `zoom.start` |
| ซูมเข้าลึกขึ้น | `zoom.extra` |
| fade ช่วงแรกเร็วขึ้น | `motion.slowOutPower` (เพิ่มค่า) และ `motion.cssEaseOut` |
| pin เด้งแรงขึ้น | ค่าที่ 2 ใน `motion.cssEasePop` (1.7 → 2.2) |
| เพิ่ม/ลบจังหวัด | `provinces` (ใส่ `lat`, `lon`) แล้วเพิ่มคู่ใน `connections` |
| ลิงก์ปุ่ม | `cta.url` |

ช่วง `[a, b]` ทั้งหมดคือช่วงความคืบหน้าการเลื่อน (0 = บนสุด, 1 = ล่างสุด)

## หมายเหตุ

- แผนที่สร้างจาก GeoJSON 77 จังหวัด (github.com/apisit/thailand.json) ถ้าจะใช้ขอบเขตทางการ (เช่น จาก กรมการปกครอง) ให้ generate SVG ใหม่ด้วย projection เดียวกัน (ค่าใน `GEO` ของ main.js)
- โลโก้ตัดมาจาก screenshot ควรแทนด้วยไฟล์ต้นฉบับความละเอียดสูง (SVG/PNG @2x) ชื่อเดิมใน `assets/`
- รองรับ `prefers-reduced-motion` (ปิด transition)
