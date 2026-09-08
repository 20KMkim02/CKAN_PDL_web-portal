0. คำสั่ง restart uwsgi : 
sudo supervisorctl restart ckan-uwsgi:*

1. แก้สี bg #F4F8FB
2. แก้ header
    2.1.จะทำให้ font Mitr light ขึ้น สี font #003647 
    2.2.ทำให้ header กินเป็นพื้นที่ top 5% ของ page พอ
    2.3.ทำให้ header เลื่อนตาม page scolling
    2.4. ทำให้ background ของ header เป็นสีใส
    2.5. แก้ header ให้ เอากรอบน้ำเงินๆออกจากปุ่มไป 
    2.6. ใส่ icon ใหม่
    2.7. เรียงลำดับ ปุ่ม
        หน้าหลัก : กลับไป IP/
        ค้นหาข้อมูล : ไปยัง /dataset (ที่จะมี map)
        แดชบอร์ด : ไปยัง /showcase
        องค์กร : ไปยัง /organization
        กลุ่ม : ไปยัง /group
        เกี่ยวกับ : ไปยัง /about
        เข้าสู่ระบบ : ไปยัง /user/login (กรณียังไม่ได้ login) ปุ่มหนา
    2.8. เอา search bar ออก

/usr/lib/ckan/default/src/ckan/ckan/public/base/css/main.css
3. 

[ขอหน้า home และหน้า dataset design 2 pages]
อยากได้ website ที่เกี่ยวกับโครงการ pd-link (provincial dataplatform)
ซึ่งจะต้องใช้เบส backend เป็น ckan-opend thai_gdc เราใช้ ckannexttheme เป็น overlay front-end โดย web จะทำการแบ่งข้อมูลเป็นระดับโดย
Organization : เป็นจังหวัด กรุงเทพ พัทยา เชียงใหม่ ยะลา 
Group : ภูมิภาคที่ใหญ่กว่าจังหวัด เหนือ อีสาน กลาง ใต้
Tag : เช่น environment Education traveling economic ,...
[page /dataset] 
- มี map รูปประเทศไทย ที่สามารถ filter dataset จากการ interact กับ mapได้
- มี ปุ่มการกด filter เช่นการใช้ or หรือ and เพื่อกรอง dataset

[page home] 
- มีการแสดง จังหวัดที่น่าสนใจในโครงการ เป็น card โชว์พวก metadata ว่ามี dataset ถูก assign ลงในจังหวัดนั้นๆกี่ dataset สามารถกดเข้าไปในcard เพื่อไปหน้า dataset ของจังหวัดนั้นได้


หน้าหลัก : กลับไป IP/
ค้นหาข้อมูล : ไปยัง /dataset (ที่จะมี map)
แดชบอร์ด : ไปยัง /showcase
องค์กร : ไปยัง /organization
กลุ่ม : ไปยัง /group
เกี่ยวกับ : ไปยัง /about
เข้าสู่ระบบ : ไปยัง /user/login (กรณียังไม่ได้ login) ปุ่มมี box ครอบ border rounded 33 px 