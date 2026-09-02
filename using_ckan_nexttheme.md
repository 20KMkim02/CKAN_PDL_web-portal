templates/
├── base.html                      ← โหลด CSS/JS หลัก, jQuery autocomplete
├── footer.html                    ← footer ทั้งหมด (ที่อยู่, เบอร์, จำนวนผู้เข้าชม, ฯลฯ)
├── home/
│   ├── index.html                 ← popup event modal หน้าแรก
│   └── layout1.html / layout2.html / layout3.html   ← เลือกใช้ตาม ckan.homepage_style ใน ckan.ini (ตอนนี้ = 1)
├── organization/
│   ├── index.html                 ← หน้า list องค์กร
│   └── read.html                  ← หน้าองค์กรเดี่ยว (ปุ่ม Import from template)
└── snippets/
    ├── facet_list.html            ← แปล facet private → Private/Public
    └── package_item.html          ← การ์ด dataset (ยอดวิว, ป้ายกลุ่ม, วันที่ไทย)

assets/
├── custom.css                     ← CSS เพิ่มเติม/override เอง
└── webassets.yml                  ← ต้อง list ไฟล์ css/js ใหม่ที่นี่ ถ้าเพิ่มไฟล์ asset ใหม่
