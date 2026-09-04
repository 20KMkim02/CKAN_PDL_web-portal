# รายการหน้า (Pages) ที่แก้ UI ได้ในระบบ + หน้าตา Original

เอกสารนี้สรุป "หน้า" (page) ทั้งหมดของเว็บ CKAN ระบบนี้ (Thai-GDC provincial open-data
portal, CKAN 2.10.7) ที่สามารถแก้ไข UI ได้ พร้อม route จริง, template ที่ควบคุมหน้านั้น,
สถานะว่า `ckan-nexttheme` (extension ในโฟลเดอร์นี้) override ไปแล้วหรือยัง และคำอธิบาย
โครงสร้างหน้าตาปัจจุบัน (original) เพื่อใช้ประกอบการตัดสินใจว่าจะเริ่มแก้จากหน้าไหนก่อน

ข้อมูลถูกเก็บจากเว็บที่รันจริงบนเครื่องนี้ (`http://127.0.0.1/` ซึ่งตรงกับ
`ckan.site_url = http://209.15.115.133`) เมื่อวันที่ 2026-09-02 ผ่าน `curl` (สำหรับหน้าที่
เข้าถึงได้แบบ public) และจากการอ่าน core template ของ CKAN โดยตรง
(`/usr/lib/ckan/default/src/ckan/ckan/templates/`) สำหรับหน้าที่ต้อง login

> หมายเหตุ: ตอนนี้ระบบยังไม่มีชุดข้อมูล (dataset) ที่เผยแพร่เลยสักตัว
> (`package_list` ว่างเปล่า) หน้าที่เกี่ยวกับ dataset จึงยังไม่มีตัวอย่างข้อมูลจริงให้ดู
> มีแค่ 5 องค์กร และ 6 กลุ่ม (ภาค) เท่านั้น

## สารบัญ / ตารางรวม

| # | หน้า | Route | Template หลัก | Override โดย nexttheme? |
|---|---|---|---|---|
| 1 | หน้าแรก (Home) | `/` | `home/index.html` + `home/layout1.html` (active) | ✅ |
| 2 | หน้าแรก layout สำรอง 2/3 | `/` (ต้องเปลี่ยน `ckan.homepage_style`) | `home/layout2.html`, `home/layout3.html` | ✅ |
| 3 | รายการชุดข้อมูล (Dataset search) | `/dataset` | `package/search.html` | ❌ (ใช้ snippet ที่ override) |
| 4 | หน้าเดี่ยวของชุดข้อมูล | `/dataset/<name>` | `package/read.html` | ❌ |
| 5 | หน้ารายละเอียด resource | `/dataset/<name>/resource/<id>` | `package/resource_read.html` | ❌ |
| 6 | รายการองค์กร | `/organization` | `organization/index.html` | ✅ |
| 7 | หน้าเดี่ยวขององค์กร | `/organization/<name>` | `organization/read.html` | ✅ (บางส่วน) |
| 8 | รายการกลุ่ม | `/group` | `group/index.html` | ❌ |
| 9 | หน้าเดี่ยวของกลุ่ม | `/group/<name>` | `group/read.html` | ❌ |
| 10 | เข้าสู่ระบบ | `/user/login` | `user/login.html` | ❌ |
| 11 | สมัครสมาชิก | `/user/new` | `user/new.html` | ❌ |
| 12 | โปรไฟล์ผู้ใช้ | `/user/<name>` | `user/read.html` | ❌ |
| 13 | Dashboard (ต้อง login) | `/dashboard` | `user/dashboard.html` | ❌ |
| 14 | เกี่ยวกับ (About) | `/about` | `home/about.html` | ❌ |
| 15 | Admin panel (sysadmin เท่านั้น) | `/ckan-admin` | `admin/index.html` | ❌ |
| 16 | Showcase | `/showcase` | `ckanext-showcase` templates | ❌ |
| — | Base layout (ทุกหน้า) | ทุก URL | `base.html` | ✅ |
| — | Footer (ทุกหน้า) | ทุก URL | `footer.html` | ✅ |
| — | Facet sidebar (component) | ปรากฏใน #3, #7, #9 | `snippets/facet_list.html` | ✅ |
| — | Dataset card (component) | ปรากฏใน #1, #3, #7, #9 | `snippets/package_item.html` | ✅ |

---

## 1. หน้าแรก (Home) — `/`

- **Template:** `home/index.html` (เนื้อหา) + `home/layout1.html` (layout ที่ active อยู่ตอนนี้ ตาม `ckan.homepage_style = 1` ใน `/etc/ckan/default/ckan.ini`)
- **Override:** ✅ ทั้งสองไฟล์ถูก override โดย nexttheme แล้ว (index.html เพิ่ม popup event modal, layout1 สืบทอดจาก core ตรงๆ ผ่าน `{% extends %}` ปกติของ CKAN)
- **โครงสร้างหน้าปัจจุบัน (original):**
  1. **Account masthead** (แถบบนสุด) — ถ้ายังไม่ login จะมีลิงก์ "เข้าสู่ระบบ" ชิดขวา
  2. **Header/Masthead** — โลโก้ CKAN ซ้าย, เมนูหลักขวา (`ชุดข้อมูล`, `องค์กร`, `กลุ่ม`, `เกี่ยวกับ`, `ตัวอย่างการใช้ข้อมูล`), และช่องค้นหา (`site-search`) ในแถบเมนู
  3. **Hero section** (`.main.hero`) พื้นหลังเป็นภาพ banner (`/base/images/bg-banner.jpg`) แบ่ง 2 คอลัมน์:
     - ซ้าย: กล่อง "module-promotion" หัวข้อ "ยินดีต้อนรับสู่ระบบ Thai-GDC" + ข้อความแนะนำ (placeholder ยังไม่มีคนแก้) + รูปแบนเนอร์ GD Catalog
     - ขวา: กล่องค้นหาชุดข้อมูล (search box ใหญ่ + placeholder "E.g. environment") พร้อม popular tags, และกล่องสถิติ (จำนวนชุดข้อมูล/องค์กร/กลุ่ม แบบตัวเลข)
  4. **Module feeds section** — แสดงรายการกลุ่ม/หมวดหมู่ (การ์ดของแต่ละภาค เช่น ภาคเหนือ ภาคกลาง ฯลฯ) ต่อด้วยพื้นที่สำหรับ dataset ล่าสุด/ที่มีคนดูเยอะ (ยังว่างเพราะไม่มี dataset)
  5. **Footer** (ดูรายละเอียดด้านล่าง หัวข้อ "Global: Footer")
  - มี popup modal อีเวนต์ที่เพิ่มโดย nexttheme (`home/index.html`) แสดงเมื่อเข้าหน้าแรก ถ้ามีการตั้งค่าอีเวนต์ไว้

## 2. หน้าแรก layout สำรอง (Home layout2 / layout3)

- **Template:** `home/layout2.html`, `home/layout3.html`
- **Override:** ✅ ทั้งคู่ (แต่ **ไม่ active** อยู่ตอนนี้ — ต้องเปลี่ยนค่า `ckan.homepage_style` เป็น 2 หรือ 3 ใน `ckan.ini` ก่อนถึงจะเห็น)
- **โครงสร้างเดิม:** เป็น layout ทางเลือกของ hero + search + stats เหมือน layout1 แต่จัดวางต่างกัน โดย layout3 มีบล็อกเพิ่มสำหรับ "dataset ล่าสุด" และ "dataset ที่มีคนดูเยอะที่สุด" (ยังไม่มีข้อมูลให้แสดงในตอนนี้เพราะไม่มี dataset)

## 3. รายการชุดข้อมูล (Dataset search) — `/dataset`

- **Template:** `package/search.html` (core, ยังไม่ override) — ใช้ snippet `package_item.html` และ `facet_list.html` ที่ override แล้วในการ์ดผลลัพธ์และ sidebar filter
- **Override:** ❌ (ตัวหน้าเอง), ✅ (component ย่อยข้างใน)
- **โครงสร้างหน้าปัจจุบัน (original):**
  - Breadcrumb + หัวข้อ "ชุดข้อมูล"
  - Layout 2 คอลัมน์: `primary` (col-md-9) = ช่องค้นหา + ปุ่ม sort + รายการผลลัพธ์แบบการ์ด (`package_item.html` ที่ override แล้ว — มียอดวิว, badge กลุ่ม, วันที่แบบไทย) + pagination; `secondary` (col-md-3) = filter sidebar (facet) ด้านข้าง ใช้ `facet_list.html` ที่แปล label private/public เป็นไทยแล้ว
  - ตอนนี้แสดง **"module-content empty"** เพราะยังไม่มี dataset ในระบบเลย

## 4. หน้าเดี่ยวของชุดข้อมูล — `/dataset/<name>`

- **Template:** `package/read.html` (extends `package/read_base.html`)
- **Override:** ❌ ยังไม่ถูกแก้ (ไม่มีตัวอย่างจริงให้ดูเพราะยังไม่มี dataset ในระบบ)
- **โครงสร้างเดิม (จาก core template):** breadcrumb → หัวข้อชื่อ dataset (`page_heading`) → คำอธิบาย (`package_notes`, รองรับ markdown) → รายการ resource (`package_resources`, แสดงเป็น list การ์ดไฟล์/ลิงก์) → tags (`package_tags`) → ตาราง "ข้อมูลเพิ่มเติม" (`package_additional_info`: license, องค์กรเจ้าของ, วันที่สร้าง/แก้ไข ฯลฯ) → sidebar ข้าง (องค์กรเจ้าของ, กลุ่ม, ปุ่ม follow)

## 5. หน้ารายละเอียด resource — `/dataset/<name>/resource/<id>`

- **Template:** `package/resource_read.html` (extends `package/base.html`)
- **Override:** ❌
- **โครงสร้างเดิม:** breadcrumb (dataset → resource) → ปุ่ม action (Manage/Download) → หัวข้อชื่อไฟล์ (`page_heading`) → URL/ที่มาของไฟล์ → พื้นที่ preview ข้อมูล (`data_preview`/`resource_view` — ใช้ view plugin ที่ติดตั้งไว้ เช่น image_view, text_view, pdf_view, datatables_view, geo_view ตามชนิดไฟล์) → คำอธิบาย resource ด้านล่าง

## 6. รายการองค์กร — `/organization`

- **Template:** `organization/index.html`
- **Override:** ✅ (nexttheme เอา block pagination เดิมออก)
- **โครงสร้างหน้าปัจจุบัน (original):** breadcrumb + หัวข้อ "องค์กร" → layout 2 คอลัมน์เหมือนหน้า dataset search: primary = ช่องค้นหาองค์กร + grid การ์ดองค์กร (มีทั้งหมด 5 องค์กรตอนนี้: `loey`, `orga`, `sub_org_ax`, `sub_org_ay`, `trat`), secondary = filter sidebar

## 7. หน้าเดี่ยวขององค์กร — `/organization/<name>`

- **Template:** `organization/read.html`
- **Override:** ✅ (บางส่วน — เพิ่มปุ่ม "Import from template" สำหรับ sysadmin เท่านั้น เมื่อเปิดหน้านี้ในฐานะ owner org)
- **โครงสร้างหน้าปัจจุบัน (original):** breadcrumb → page-header ของ organization (โลโก้/ชื่อ/เมนูย่อย "เกี่ยวกับ") → ปุ่ม action (Add dataset ถ้ามีสิทธิ์, "Import from template" ถ้าเป็น sysadmin) → ช่องค้นหา dataset ภายในองค์กร + filter sidebar (facet) + รายการ dataset ของ organization นี้ (ใช้การ์ด `package_item.html`) — ตอนนี้แสดง empty state เพราะยังไม่มี dataset

## 8. รายการกลุ่ม — `/group`

- **Template:** `group/index.html`
- **Override:** ❌
- **โครงสร้างหน้าปัจจุบัน (original):** breadcrumb + หัวข้อ "กลุ่ม" → layout 2 คอลัมน์: primary = ช่องค้นหา + **media-grid** การ์ดกลุ่ม (ตอนนี้มี 6 กลุ่ม = ภาคกลาง, ภาคตะวันตก, ภาคตะวันออก, ภาคตะวันออกเฉียงเหนือ, ภาคเหนือ, ภาคใต้), secondary = filter sidebar

## 9. หน้าเดี่ยวของกลุ่ม — `/group/<name>`

- **Template:** `group/read.html` (extends `group/read_base.html`)
- **Override:** ❌
- **โครงสร้างหน้าปัจจุบัน (original):** breadcrumb → page-header ของกลุ่ม → ช่องค้นหา dataset ภายในกลุ่ม + filter sidebar + รายการ dataset (การ์ด `package_item.html` ที่ override แล้ว) + pagination — ตอนนี้ empty เพราะไม่มี dataset

## 10. เข้าสู่ระบบ — `/user/login`

- **Template:** `user/login.html`
- **Override:** ❌
- **โครงสร้างหน้าปัจจุบัน (original):** breadcrumb → layout 2 คอลัมน์: primary = ฟอร์ม login (username/email + password + ปุ่ม "เข้าสู่ระบบ" + ลิงก์ "ลืมรหัสผ่าน?"), secondary = ข้อความ/ลิงก์เสริม (สมัครสมาชิก ฯลฯ)

## 11. สมัครสมาชิก — `/user/new`

- **Template:** `user/new.html`
- **Override:** ❌
- **โครงสร้างเดิม (จาก core template):** ฟอร์มสมัครสมาชิก (`new_user_form.html`) — ชื่อผู้ใช้, อีเมล, รหัสผ่าน, ยืนยันรหัสผ่าน — layout เดียวกับหน้า login/edit

## 12. โปรไฟล์ผู้ใช้ — `/user/<name>`

- **Template:** `user/read.html` (extends `user/read_base.html`)
- **Override:** ❌
- **โครงสร้างเดิม:** page-header โปรไฟล์ (avatar, ชื่อผู้ใช้, ปุ่ม follow/edit) → รายการ dataset ที่ผู้ใช้เป็นเจ้าของ → sidebar แสดงกิจกรรม (activity stream) ของผู้ใช้

## 13. Dashboard (ต้อง login) — `/dashboard`

- **Template:** `user/dashboard.html` (extends `user/edit_base.html`)
- **Override:** ❌
- **โครงสร้างเดิม (จาก core template):** page-header พร้อมเมนูย่อยแท็บ (`dashboard_nav_links`: News feed / Datasets / Organizations / Groups) → เนื้อหาหลักตามแท็บที่เลือก (feed กิจกรรม, รายการ dataset/organization/group ของผู้ใช้) — ต้อง login ก่อนถึงเข้าได้ (curl แบบไม่ login ได้ 403)

## 14. เกี่ยวกับ (About) — `/about`

- **Template:** `home/about.html`
- **Override:** ❌
- **โครงสร้างหน้าปัจจุบัน (original):** breadcrumb + หัวข้อ "เกี่ยวกับ" → เนื้อหา markdown แบบ static (`ckan.site_about` ใน config) แสดงในกล่อง `module-content` เดียว ไม่มี sidebar

## 15. Admin panel (sysadmin เท่านั้น) — `/ckan-admin`

- **Template:** `admin/index.html` (extends `admin/base.html`)
- **Override:** ❌
- **โครงสร้างเดิม (จาก core template):** primary content = ฟอร์มตั้งค่าระบบ (site title, site description, custom CSS, about, การตั้งค่า general) พร้อมปุ่ม Save; secondary sidebar = ลิงก์เมนูย่อย (Sysadmins, Trash, Config declaration) — ต้อง login เป็น sysadmin ถึงเข้าได้ (curl แบบไม่ login ได้ 403)

## 16. Showcase — `/showcase`

- **Template:** มาจาก extension `ckanext-showcase` (ติดตั้งแยกต่างหาก ไม่ได้อยู่ใน repo นี้)
- **Override:** ❌
- **โครงสร้างหน้าปัจจุบัน (original):** หน้าคล้ายกับ `/dataset`/`/group` — breadcrumb + หัวข้อ, layout 2 คอลัมน์ (filter sidebar + รายการการ์ด showcase), ตอนนี้เป็น empty state เพราะยังไม่มี showcase ถูกสร้างไว้

---

## Global: Base layout (ทุกหน้า)

- **Template:** `base.html`
- **Override:** ✅ — เพิ่ม CSS/JS เสริม (jQuery, jQuery UI, script autocomplete ค้นหา, asset ของ `thai_gdc`) เข้าไปใน `<head>`/`<scripts>` ของทุกหน้า
- **โครงสร้างส่วนที่ใช้ร่วมกันทุกหน้า:**
  1. **Account masthead** — แถบบนสุด, ไม่ login = ลิงก์ "เข้าสู่ระบบ"
  2. **Header/Masthead** (`header.masthead`) — โลโก้ CKAN (ซ้าย), เมนูหลัก (ขวา: ชุดข้อมูล / องค์กร / กลุ่ม / เกี่ยวกับ / ตัวอย่างการใช้ข้อมูล), ช่องค้นหา (`.site-search`)
  3. `<div id="content">` — เนื้อหาเฉพาะของแต่ละหน้า (แทรก flash message ด้วย)
  4. **Footer** — ดูหัวข้อถัดไป
  5. Cookie consent banner (popup ด้านล่าง แสดงจนกว่าจะกด "ยอมรับคุกกี้")

## Global: Footer (ทุกหน้า)

- **Template:** `footer.html`
- **Override:** ✅ ทั้งหมด (ไม่ได้ extends จาก block เดิมของ core มากนัก เขียนใหม่เกือบทั้งหมด)
- **โครงสร้างปัจจุบัน (original):**
  - คอลัมน์ซ้าย: ที่อยู่หน่วยงาน, เบอร์โทร, อีเมล (จาก config `site_org_*`, ตอนนี้ยังว่างเพราะยังไม่ได้ตั้งค่า)
  - คอลัมน์ขวา: จำนวนผู้เข้าชม (ตัวนับ `totalVisitor`), ลิงก์ policy, ตัวเลือกภาษา (ไทย/English), โลโก้ "Powered by CKAN" + โลโก้ OpenD, ข้อความ "สนับสนุนระบบ Thai-GDC โดย สำนักงานสถิติแห่งชาติ", ลิงก์ไปเว็บที่เกี่ยวข้อง (gdcatalog.go.th), เลขรุ่นโปรแกรม + วันที่
  - Cookie notice popup (ข้อความ 2 บรรทัด + ปุ่ม "ยอมรับคุกกี้")

## Component: Facet sidebar (ไม่ใช่หน้าเดี่ยว)

- **Template:** `snippets/facet_list.html`
- **Override:** ✅ — แปล label `private` → "Private/Public" เป็นภาษาที่อ่านง่ายขึ้น
- **ปรากฏใน:** sidebar (`secondary`) ของหน้า #3 (`/dataset`), #7 (`/organization/<name>`), #9 (`/group/<name>`), และ showcase

## Component: Dataset card (ไม่ใช่หน้าเดี่ยว)

- **Template:** `snippets/package_item.html`
- **Override:** ✅ — เพิ่มยอดวิว (view count), badge กลุ่ม, และวันที่แบบไทยในการ์ด
- **ปรากฏใน:** รายการ dataset ทุกที่ที่มีการ์ดแสดงชุดข้อมูล — หน้า #1 (module-feeds), #3, #7, #9

---

## ข้อสังเกตประกอบการตัดสินใจ (ไม่ใช่ข้อสรุปว่าต้องเริ่มหน้าไหนก่อน)

- หน้าที่ผู้ใช้ทั่วไป (ไม่ login) เจอบ่อยที่สุดคือ **หน้าแรก (#1)**, **รายการ/หน้าเดี่ยวองค์กร (#6, #7)**, และ **รายการ/หน้าเดี่ยวชุดข้อมูล (#3, #4)** — ทั้งหมดนี้เข้าถึงได้จากเมนูหลักที่อยู่ใน `base.html`
- ตอนนี้ nexttheme override ไปแล้วบางส่วนคือ: base layout, footer, home (ทุก layout), organization list/detail (บางส่วน), และ component ย่อย 2 ตัว (facet, dataset card) — ส่วนที่ **ยังไม่ถูกแตะเลย** คือ dataset detail/resource, group ทั้งหมด, user/login/register/dashboard, about, admin, showcase
- เนื่องจากยังไม่มี dataset จริงในระบบ หน้าที่เกี่ยวกับ dataset (list/detail/resource) จะยังไม่เห็นภาพเต็มรูปแบบจนกว่าจะมีข้อมูลตัวอย่างเข้าไปในระบบก่อน
