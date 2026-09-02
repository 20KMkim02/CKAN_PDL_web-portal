# คู่มือติดตั้ง VM ใหม่ให้เหมือนเครื่องเดิมทั้งหมด (CKAN 2.10.7 + thai_gdc + nexttheme)

> ตรวจสอบจากเครื่องที่รันอยู่จริง (`49.0.192.67`) เมื่อ 17/08/2026
> คู่มือนี้ครอบคลุม: base install + extensions + **การแก้ไขโค้ดในเครื่อง (patch)** + extension ที่เขียนเอง (`nexttheme`) + ค่า config จริงทั้งหมด + โครงสร้างข้อมูล/ผู้ใช้/สิทธิ์
> ถ้าทำตามลำดับข้อ 1 → 12 จบ จะได้ระบบเหมือนเครื่องเดิมทุกอย่าง

---

# 🛑 ก่อนเริ่ม — ถามผู้ใช้ 3 ข้อนี้ให้ครบก่อน แล้วจึงเริ่มรันคำสั่ง

> **สำหรับ Claude / ผู้ติดตั้ง:** 3 ค่านี้ **ห้ามเดา** เพราะเดาผิดแล้วต้องรื้อทำใหม่
> ให้ถามผู้ใช้ (ใช้ `AskUserQuestion` หรือถามในแชท) → จดคำตอบ → **แล้วค่อยเริ่มข้อ 2**
> ถ้าผู้ใช้ตอบว่า "ใช้ค่า default" ให้ยึดคอลัมน์ *ค่า default* ด้านล่างได้ทันที

| # | ต้องถาม | ค่า default (ถ้าผู้ใช้ให้ใช้ค่าเดิม) | ใช้ที่ไหน / ถ้าผิดจะเกิดอะไร |
|---|---|---|---|
| Q1 | **`ckan.site_url` ของ VM ใหม่** — IP หรือ domain? และจะใช้ http หรือ https? | ❌ ไม่มี default — ต้องถาม (เสนอค่าที่ตรวจได้ด้วย `curl -s ifconfig.me` หรือ `hostname -I` ให้ผู้ใช้ยืนยัน) | ข้อ 7.2 · ถ้าผิด ลิงก์ในเว็บ/อีเมลรีเซ็ตรหัส/DCAT จะชี้ผิดเครื่อง (เครื่องเดิม = `http://49.0.192.67`) |
| Q2 | **ชุดรหัสผ่าน** — ใช้ชุดเดิม `password1234!` ต่อ หรือเปลี่ยนใหม่? | ✅ **ใช้ `password1234!` เหมือนเดิม** (ผู้ใช้ยืนยันแล้ว 17/08/2026) — ครอบคลุม: DB role `ckan_default`, `datastore_default`, user `sysadmin`, และ user ทดสอบ 4 คน (`viewer_trat`, `admin_trat`, `viewer_loey`, `member`) ‖ ส่วนชุด OrgA/SubOrgAX ใช้รหัสเดิมตาม `user_pass.txt` (`OrgAMember@12345` ฯลฯ ดูข้อ 11.1) | ข้อ 2.1, 7.2, 7.6, 11.1 · ต้องตรงกันทั้ง DB role และ 4 บรรทัด URL ใน `ckan.ini` |
| Q3 | **จะย้ายข้อมูลจริง (dataset/showcase/DataStore) จากเครื่องเดิมไหม?** ถ้าใช่ → ขอ **host / user / SSH key หรือรหัสผ่าน** ของเครื่องเดิม (`49.0.192.67`) | ❌ ไม่มี default — ต้องถาม | ข้อ 6 ทางเลือก A + ข้อ 12 ทาง A · **ถ้าไม่มี SSH access → ทำได้แค่โครงสร้าง** (5 org + 6 group + 12 user + role + 5 showcase admin) ส่วน **7 dataset + 2 showcase + ไฟล์ resource 6.6 MB จะไม่มี** ต้องสร้างผ่าน UI ทีหลัง (ผู้ใช้ต้องรับทราบข้อนี้ก่อน) |

**ตัวอย่างคำถามที่ควรถาม (ถามครั้งเดียวจบ):**

```
1) ckan.site_url ของ VM ใหม่ให้ใช้อะไร? (เช่น http://10.0.0.5 หรือ https://data.example.go.th)
2) รหัสผ่านใช้ชุดเดิมทั้งหมด (password1234! + OrgXxx@12345) หรือให้เปลี่ยนใหม่?
3) จะ copy ข้อมูล dataset/showcase จากเครื่องเดิม 49.0.192.67 ด้วยไหม?
   - ถ้าใช่: ขอ SSH user + key/รหัสผ่าน (จะใช้ pg_dump + rsync ตามข้อ 12 ทาง A)
   - ถ้าไม่: จะได้เฉพาะโครงสร้าง org/group/user/สิทธิ์ ไม่มี dataset/showcase — โอเคไหม?
```

**หมายเหตุอื่นที่ไม่ต้องถาม (ตัดสินใจได้เอง):** secret keys (`beaker.session.secret`, `WTF_CSRF_SECRET_KEY`) ให้ปล่อยให้ `ckan generate config` สุ่มใหม่ · `ckan.site_api_token` ให้สร้างใหม่ตามข้อ 9 · ไม่ต้อง copy จากเครื่องเดิม

---

## 0. สรุปผลตรวจสอบ — "อะไรที่ถูกแก้ไปจากคู่มือเดิม"

คู่มือเดิม 2 ไฟล์ (`ckan-installation.md`, `ckan-extension.md`) **ยังไม่ครบ** สิ่งที่ต่างจากคู่มือมี 8 รายการ:

| # | รายการที่แก้ | อยู่ที่ | มีในคู่มือเดิมไหม | ขั้นตอนในคู่มือนี้ |
|---|---|---|---|---|
| 1 | **patch ckanext-showcase 2 ไฟล์** — เพิ่ม `include_private: True` ให้ showcase มองเห็น dataset ที่เป็น private | `src/ckanext-showcase/ckanext/showcase/logic/action/get.py`, `.../utils.py` | ❌ **ไม่มี** | ข้อ 5 |
| 2 | pin `pyld>=2.0.4,<3.0.0` ใน ckanext-dcat | `src/ckanext-dcat/requirements.txt` | ✅ มี | ข้อ 4.4 |
| 3 | **extension ที่เขียนเอง `ckanext-nexttheme`** ติดตั้งแบบ editable จาก `/root/apps/ckan` (override 10 template + custom.css) | `/root/apps/ckan` | ❌ **ไม่มี** | ข้อ 6 |
| 4 | `nexttheme` ถูกเติมใน `ckan.plugins` ต่อจาก `thai_gdc` | `/etc/ckan/default/ckan.ini` | ❌ **ไม่มี** | ข้อ 7 |
| 5 | **`ckan.site_api_token` ถูกตั้งใน DB (`system_info`)** — thai_gdc ใช้ค่านี้ส่งต่อเป็น `ckanext.xloader.api_token` ถ้าไม่ตั้ง xloader จะ push ข้อมูลเข้า DataStore ไม่ได้ | ตารางกลาง `system_info` (ตั้งผ่าน `/ckan-admin/config`) | ❌ **ไม่มี** | ข้อ 9 |
| 6 | crontab มี 4 บรรทัด (คู่มือ base มี 2, คู่มือ extension เพิ่มอีก 2 แยกกันอยู่) | `crontab -e` ของ root | ⚠️ กระจัดกระจาย | ข้อ 8.5 |
| 7 | `ckan.resource_proxy.max_file_size = 104857600` **ที่คู่มือ extension สั่งให้ใส่ แต่เครื่องจริงไม่ได้ใส่** | `ckan.ini` | ⚠️ คู่มือเกินจริง | ข้อ 7 (ไม่ต้องใส่ ถ้าต้องการเหมือนเดิม) |
| 8 | ข้อมูลจริงในระบบ: 5 organization (2 ตัวเป็น sub-org), 6 group, 12 user + role, 5 showcase admin, 7 dataset, 2 showcase | PostgreSQL | ❌ **ไม่มี** | ข้อ 10–11 |

**ไม่พบการแก้ไข** ใน: `src/ckan` (core), `ckanext-thai-gdc`, `ckanext-xloader`, `ckanext-geoview`, `ckanext-hierarchy`, `ckanext-opendstats`, `ckanext-pdfview`, `ckanext-scheming` — ทุก repo สะอาด (ตรงกับ tag/commit ต้นทาง)
**ไม่พบการแก้ไข** ใน `/etc/nginx/nginx.conf`, `/etc/redis/redis.conf`, `postgresql.conf`, `pg_hba.conf`, `solr.in.sh` (ทั้งหมดเป็นค่า default จาก package)

---

## 1. สเปกเป้าหมาย (ต้องได้เวอร์ชันเหล่านี้)

| ส่วนประกอบ | เวอร์ชันบนเครื่องเดิม |
|---|---|
| OS | Ubuntu 24.04.3 LTS (noble) |
| Python (venv CKAN) | 3.9.25 (จาก `ppa:deadsnakes`) |
| CKAN | 2.10.7 (`git tag ckan-2.10.7`) |
| PostgreSQL | 16.14 |
| Solr | 8.11.4 + Java OpenJDK **8** |
| Redis | 7.0.15 |
| Nginx | 1.24.0 |
| uWSGI | 2.0.31 |
| pip / setuptools ใน venv | pip 25.3 / setuptools 69.5.1 |
| Path | source `/usr/lib/ckan/default`, storage `/var/lib/ckan/default`, config `/etc/ckan/default` |

### เวอร์ชัน extension (ต้องตรงตามนี้)

| Extension | เวอร์ชัน / commit ที่ใช้จริง |
|---|---|
| ckanext-thai_gdc | `v3.0.0` (commit `2ab39a0`) — NECTEC |
| ckanext-nexttheme | `0.1.0` (โค้ดเราเอง — ภาคผนวก A) |
| ckanext-showcase | `1.6.0` (commit `875937d`) + **patch ข้อ 5** |
| ckanext-xloader | `nectec_stable-72-ga17dd34` |
| ckanext-opendstats | commit `e497397` (branch `dev-py3`) |
| ckanext-dcat | `v2.3.0` + patch requirements |
| ckanext-scheming | `release-3.1.0` |
| ckanext-hierarchy | `v1.2.2` |
| ckanext-geoview | `v0.2.2` |
| ckanext-pdfview | `0.0.8` (dist ระบุ 0.0.7) |

---

## 2. ติดตั้งฐาน: PostgreSQL + Solr + Ubuntu packages

> รหัสผ่าน DB = **`password1234!`** (ตามคำตอบ **Q2** — ใช้ชุดเดิม) ถ้าผู้ใช้เปลี่ยน ต้องแก้ทั้ง 4 บรรทัด URL ในข้อ 7.2 ให้ตรงกันด้วย

### 2.1 PostgreSQL

```sh
sudo apt-get update
sudo apt-get install -y postgresql
sudo -u postgres createuser -S -D -R -P ckan_default          # password1234!
sudo -u postgres createdb -O ckan_default ckan_default -E utf-8
sudo -u postgres createdb -O ckan_default datastore_default -E utf-8
sudo -u postgres createuser -S -D -R -P -l datastore_default  # password1234!
sudo -u postgres psql -l
```

### 2.2 Java 8 + Solr 8.11.4

```sh
sudo apt-get install -y openjdk-8-jdk
sudo update-alternatives --set java /usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java
java -version    # ต้องเป็น 1.8.0_xxx

wget http://archive.apache.org/dist/lucene/solr/8.11.4/solr-8.11.4.tgz
tar xzf solr-8.11.4.tgz solr-8.11.4/bin/install_solr_service.sh --strip-components=2
sudo bash ./install_solr_service.sh solr-8.11.4.tgz
```

สร้าง core `ckan` และวาง schema ของ CKAN 2.10.7:

```sh
sudo su solr -c '/opt/solr/bin/solr create -c ckan'
sudo su solr -c 'cd /var/solr/data/ckan/conf && mv managed-schema managed-schema.bak && wget -O managed-schema https://raw.githubusercontent.com/ckan/ckan/refs/tags/ckan-2.10.7/ckan/config/solr/schema.xml'
sudo service solr restart
```

### 2.3 Firewall (ปิดพอร์ต Solr 8983 จากภายนอก — SOLR-13669)

```sh
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
sudo ufw status    # ต้องเห็นเฉพาะ 22/tcp, 80/tcp, 443
```

### 2.4 Ubuntu packages ที่ CKAN ต้องใช้

```sh
sudo add-apt-repository -y ppa:deadsnakes/ppa
sudo apt install -y python3.9 python3.9-venv python3.9-dev build-essential libpq-dev redis-server git
```

---

## 3. ติดตั้ง CKAN 2.10.7

```sh
sudo mkdir -p /usr/lib/ckan/default /var/lib/ckan/default /etc/ckan/default
sudo chown -R `whoami` /usr/lib/ckan/default /var/lib/ckan/default /etc/ckan/default

python3.9 -m venv /usr/lib/ckan/default
source /usr/lib/ckan/default/bin/activate
cd /usr/lib/ckan/default
pip install --upgrade "setuptools<70" "pip<26"
pip install -e 'git+https://github.com/ckan/ckan.git@ckan-2.10.7#egg=ckan[requirements]'
```

สร้าง config เริ่มต้น (แล้วไปแก้ค่าจริงในข้อ 7):

```sh
ckan generate config /etc/ckan/default/ckan.ini
```

---

## 4. ติดตั้ง Extension ทั้ง 9 ตัว (ทำตามลำดับนี้)

```sh
source /usr/lib/ckan/default/bin/activate
cd /usr/lib/ckan/default
```

### 4.1 ckanext-geoview
```sh
pip install -e 'git+https://github.com/ckan/ckanext-geoview.git@v0.2.2#egg=ckanext-geoview'
```

### 4.2 ckanext-xloader
```sh
pip install -e 'git+https://gitlab.nectec.or.th/opend/ckanext-xloader.git#egg=ckanext-xloader'
pip install -r src/ckanext-xloader/requirements.txt
pip install -U requests[security]
```

### 4.3 ckanext-pdfview
```sh
pip install -e 'git+https://github.com/ckan/ckanext-pdfview.git@0.0.8#egg=ckanext-pdfview'
```

### 4.4 ckanext-dcat (+ patch pyld)
```sh
pip install -e 'git+https://github.com/ckan/ckanext-dcat.git@v2.3.0#egg=ckanext-dcat'
sed -i 's/^pyld>=2.0.4$/pyld>=2.0.4,<3.0.0/' /usr/lib/ckan/default/src/ckanext-dcat/requirements.txt
pip install -r src/ckanext-dcat/requirements.txt
```

ตรวจสอบว่า patch ติด:
```sh
git -C /usr/lib/ckan/default/src/ckanext-dcat diff --stat   # ต้องเห็น requirements.txt | 2 +-
```

### 4.5 ckanext-scheming
```sh
pip install -e 'git+https://github.com/ckan/ckanext-scheming.git@release-3.1.0#egg=ckanext-scheming'
```

### 4.6 ckanext-hierarchy
```sh
pip install -e 'git+https://github.com/ckan/ckanext-hierarchy.git@v1.2.2#egg=ckanext-hierarchy'
```

### 4.7 ckanext-opendstats
```sh
pip install -e 'git+https://gitlab.nectec.or.th/opend/ckanext-opendstats.git@dev-py3#egg=ckanext-opendstats'
```

### 4.8 ckanext-showcase
```sh
pip install -e 'git+https://gitlab.nectec.or.th/opend/dev-python3/ckanext-showcase.git#egg=ckanext-showcase'
```

### 4.9 ckanext-thai_gdc
```sh
pip install -e 'git+https://gitlab.nectec.or.th/opend/ckanext-thai_gdc.git#egg=ckanext-thai_gdc'
pip install -r src/ckanext-thai-gdc/requirements.txt
```
> `requirements.txt` ของ thai_gdc = `numpy==1.25.0`, `pandas`, `openpyxl==3.1.0`, `XlsxWriter==3.2.0`, `xlrd==1.2.0`

---

## 5. ⚠️ Patch ckanext-showcase (สำคัญ — ไม่มีในคู่มือเดิม)

**ปัญหาที่ patch นี้แก้:** showcase เรียก `package_search` โดยไม่ส่ง `include_private` → dataset ที่เป็น **private จะไม่ปรากฏ** ทั้งในหน้า showcase และในหน้าค้นหา "เพิ่ม dataset เข้า showcase" ทำให้ showcase ที่ผูก private dataset แสดงว่าง

```sh
cd /usr/lib/ckan/default/src/ckanext-showcase

# 5.1 showcase_package_list — ให้ดึง private dataset ที่ผูกกับ showcase มาแสดงได้
sed -i "s/{'q': q, 'rows': 100})/{'q': q, 'rows': 100, 'include_private': True})/" \
  ckanext/showcase/logic/action/get.py

# 5.2 _add_dataset_search — ให้หน้าค้นหาเพิ่มชุดข้อมูลเข้า showcase เห็น private dataset
sed -i "s/^            'extras': search_extras$/            'extras': search_extras,\n            'include_private': True/" \
  ckanext/showcase/utils.py
```

ตรวจสอบว่า patch ติดถูกต้อง (ต้องเห็น 2 ไฟล์ / 3 บรรทัดที่เปลี่ยน):

```sh
git -C /usr/lib/ckan/default/src/ckanext-showcase diff
```

ผลที่ต้องได้:
```diff
--- a/ckanext/showcase/logic/action/get.py
+++ b/ckanext/showcase/logic/action/get.py
@@ -78,7 +77,7 @@ def showcase_package_list(context, data_dict):
-            {'q': q, 'rows': 100})
+            {'q': q, 'rows': 100, 'include_private': True})

--- a/ckanext/showcase/utils.py
+++ b/ckanext/showcase/utils.py
@@ -343,7 +343,8 @@ def _add_dataset_search(showcase_id, showcase_name):
-            'extras': search_extras
+            'extras': search_extras,
+            'include_private': True
```

> **หมายเหตุ:** บรรทัดที่ 2 (`'rows': 100`) มี 2 จุดในไฟล์ `get.py` แต่ sed ด้านบนจับเฉพาะจุดของ `showcase_package_list` เท่านั้น (อีกจุดเป็น `{'q': q, 'fq': fq, 'rows': 100}` ซึ่ง **ไม่ต้องแก้**)

---

## 6. สร้างและติดตั้ง extension `ckanext-nexttheme` (theme ที่เขียนเอง)

### ทางเลือก A — copy จาก repo เดิม (แนะนำ)

```sh
sudo mkdir -p /root/apps
# copy โฟลเดอร์ ckan/ ทั้งก้อนจากเครื่องเดิมหรือจาก git repo มาไว้ที่ /root/apps/ckan
rsync -av root@49.0.192.67:/root/apps/ckan/ /root/apps/ckan/ --exclude __pycache__
```

### ทางเลือก B — สร้างใหม่จากภาคผนวก A (ถ้าไม่มี repo)

โครงสร้างที่ต้องได้:

```
/root/apps/ckan/
├── setup.py                    ← ต้องสร้าง (หายไปจาก repo เดิม! ดูภาคผนวก A.1)
└── ckanext/
    ├── __init__.py             (ว่าง)
    └── nexttheme/
        ├── __init__.py         (ว่าง)
        ├── plugin.py
        ├── assets/
        │   ├── webassets.yml
        │   └── custom.css
        └── templates/
            ├── base.html
            ├── footer.html
            ├── home/{index,layout1,layout2,layout3}.html
            ├── organization/{index,read}.html
            └── snippets/{facet_list,package_item}.html
```

> ⚠️ **ข้อค้นพบ:** บนเครื่องเดิม `setup.py` / `pyproject.toml` ของ nexttheme **ถูกลบทิ้งไปหลังติดตั้ง** (pip ยังใช้ได้เพราะติดตั้งแบบ editable ไว้แล้ว) VM ใหม่ต้องมีไฟล์นี้ก่อน ไม่งั้น `pip install -e` จะ fail — เนื้อหาอยู่ในภาคผนวก A.1

### 6.3 ติดตั้ง

```sh
source /usr/lib/ckan/default/bin/activate
pip install -e /root/apps/ckan
pip list | grep nexttheme     # ต้องเห็น: ckanext-nexttheme 0.1.0 /root/apps/ckan
```

---

## 7. ค่า `ckan.ini` ฉบับที่ใช้จริง

```sh
sudo nano /etc/ckan/default/ckan.ini
```

### 7.1 บรรทัดที่ต้องเติม **ทันทีหลัง** `[app:main]`

```ini
[app:main]
ckanext.xloader.just_load_with_messytables = true
ckanext.xloader.ssl_verify = false
ckan.datatables.state_saving = false
```

### 7.2 ค่าที่ต้องแก้จาก default (ตามเครื่องเดิมทุกตัว)

| Key | ค่าบนเครื่องเดิม |
|---|---|
| `sqlalchemy.url` | `postgresql://ckan_default:password1234!@localhost/ckan_default` |
| `ckanext.xloader.jobs_db.uri` | `postgresql://ckan_default:password1234!@localhost/ckan_default` *(เติมใหม่ ถัดจาก sqlalchemy.url)* |
| `ckan.datastore.write_url` | `postgresql://ckan_default:password1234!@localhost/datastore_default` |
| `ckan.datastore.read_url` | `postgresql://datastore_default:password1234!@localhost/datastore_default` |
| `ckan.site_url` | **ใส่คำตอบจาก Q1** เช่น `http://<IP ของ VM ใหม่>` *(เครื่องเดิม `http://49.0.192.67`)* |
| `ckan.locales_offered` | `th en` |
| `ckan.max_resource_size` | `100` |
| `ckan.upload.admin.mimetypes` | `image/png image/gif image/jpeg image/svg+xml image/x-icon image/vnd.microsoft.icon application/vnd.ms-excel.sheet.macroEnabled.12 application/vnd.openxmlformats-officedocument.spreadsheetml.sheet` |
| `ckan.views.default_views` | `image_view datatables_view text_view webpage_view geo_view geojson_view shp_view pdf_view` |

### 7.3 `ckan.plugins` — ลำดับสำคัญมาก คัดลอกทั้งบรรทัด

```ini
ckan.plugins = thai_gdc nexttheme showcase stats opendstats activity image_view datatables_view text_view webpage_view resource_proxy geo_view geojson_view shp_view xloader datastore pdf_view dcat dcat_json_interface structured_data scheming_datasets hierarchy_display hierarchy_form
```

> `thai_gdc` ต้องมาก่อนสุด, `nexttheme` ต่อจาก `thai_gdc` (เพราะ nexttheme override template ของ thai_gdc)

### 7.4 บล็อก config ของ extension — วางต่อจากบรรทัด `ckan.download_proxy =`

```ini
## Scheming Settings For thai gdc ###########
scheming.dataset_schemas = ckanext.thai_gdc:ckan_dataset.json
scheming.presets = ckanext.thai_gdc:presets.json

## Showcase Settings ###########
ckanext.showcase.editor = ckeditor
ckan.upload.showcase.types = image
ckan.upload.showcase.mimetypes = image/png image/gif image/jpeg

## Geoview Settings ###########
ckanext.geoview.ol_viewer.formats = wms
ckanext.geoview.shp_viewer.srid = 4326
ckanext.geoview.shp_viewer.encoding = UTF-8

ckanext.spatial.common_map.type = custom
ckanext.spatial.common_map.custom.url = https://tile.openstreetmap.org/{z}/{x}/{y}.png
ckanext.spatial.common_map.attribution = Map tiles & Data by OpenStreetMap, under CC BY SA.
```

> 🔎 คู่มือเดิมสั่งให้ใส่ `ckan.resource_proxy.max_file_size = 104857600` ด้วย แต่ **เครื่องเดิมไม่มีบรรทัดนี้** — ถ้าต้องการ "เหมือนเดิมทุกอย่าง" ให้ **ไม่ใส่**

### 7.5 ค่าที่ปล่อยตาม default ของ `ckan generate config` (ยืนยันแล้วว่าเครื่องเดิมไม่แก้)

`ckan.tracking_enabled = false`, `ckan.auth.*` ทุกตัว, `ckan.homepage_style = 1`, `ckan.locale_default = en`, `ckan.site_title = CKAN`, `search.facets`, `ckan.datasets_per_page = 20`
→ **แต่ค่าเหล่านี้บางตัวถูก thai_gdc override ตอน runtime** ดูภาคผนวก B (แก้ใน ckan.ini ไม่มีผล)

**secret keys** (`beaker.session.secret`, `beaker.session.validate_key`, `WTF_CSRF_SECRET_KEY`) — ปล่อยให้ `ckan generate config` สุ่มค่าใหม่ของ VM ใหม่ **ไม่ต้อง copy จากเครื่องเดิม** (ยกเว้นกรณีต้องการให้ session/cookie ของผู้ใช้เดิมยังใช้ได้)

### 7.6 สร้าง DB schema + sysadmin + สิทธิ์ DataStore

```sh
source /usr/lib/ckan/default/bin/activate
ckan -c /etc/ckan/default/ckan.ini db init
ckan -c /etc/ckan/default/ckan.ini sysadmin add sysadmin email=yodsapat.se@bdi.or.th password='password1234!'
ckan -c /etc/ckan/default/ckan.ini datastore set-permissions | sudo -u postgres psql --set ON_ERROR_STOP=1
ckan -c /etc/ckan/default/ckan.ini opendstats db-init      # ต้องรัน ไม่งั้นหน้า stats พัง
```

> `opendstats db-init` สร้าง 3 ตาราง: `ckanext_opendstats_package_views`, `ckanext_opendstats_resource_downloads`, `ckanext_opendstats_usage_by_org`
> ถ้าข้อมูลเยอะควรรันใน `tmux`

---

## 8. ตั้งค่า Production (uWSGI + Supervisor + Nginx + cron)

### 8.1 uWSGI
```sh
source /usr/lib/ckan/default/bin/activate
pip install uwsgi
deactivate
sudo cp /usr/lib/ckan/default/src/ckan/ckan-uwsgi.ini /etc/ckan/default/
sudo cp /usr/lib/ckan/default/src/ckan/wsgi.py /etc/ckan/default/
```
ยืนยันว่า `/etc/ckan/default/ckan-uwsgi.ini` เป็นค่า default (เครื่องเดิมไม่แก้): `http = 127.0.0.1:8080`, `uid/gid = www-data`, `harakiri = 50`, `max-requests = 5000`, `buffer-size = 32768`

### 8.2 Supervisor
```sh
sudo apt-get install -y supervisor
sudo mkdir -p /var/log/ckan
sudo nano /etc/supervisor/conf.d/ckan-uwsgi.conf
```
```ini
[program:ckan-uwsgi]
command=/usr/lib/ckan/default/bin/uwsgi -i /etc/ckan/default/ckan-uwsgi.ini
numprocs=1
process_name=%(program_name)s-%(process_num)02d
stdout_logfile=/var/log/ckan/ckan-uwsgi.stdout.log
stderr_logfile=/var/log/ckan/ckan-uwsgi.stderr.log
autostart=true
autorestart=true
startsecs=10
stopwaitsecs=600
stopsignal=QUIT
```
worker สำหรับ background job (ใช้ไฟล์ template ของ CKAN ตรง ๆ ไม่แก้):
```sh
sudo cp /usr/lib/ckan/default/src/ckan/ckan/config/supervisor-ckan-worker.conf /etc/supervisor/conf.d/ckan-worker.conf
```

### 8.3 Nginx
```sh
sudo apt-get install -y nginx
sudo nano /etc/nginx/sites-available/ckan
```
```nginx
proxy_cache_path /var/cache/nginx/proxycache levels=1:2 keys_zone=cache:30m max_size=250m;
proxy_temp_path /tmp/nginx_proxy 1 2;

server {
    client_max_body_size 100M;
    server_tokens off;
    location / {
        proxy_pass http://127.0.0.1:8080/;
        proxy_set_header X-Forwarded-For $remote_addr;
        proxy_set_header Host $host;
        proxy_cache cache;
        proxy_cache_bypass $cookie_auth_tkt;
        proxy_no_cache $cookie_auth_tkt;
        proxy_cache_valid 30m;
        proxy_cache_key $host$scheme$proxy_host$request_uri;
        # In emergency comment out line to force caching
        # proxy_ignore_headers X-Accel-Expires Expires Cache-Control;
    }
}
```

### 8.4 เปิดใช้งาน + สิทธิ์ไฟล์
```sh
sudo rm -f /etc/nginx/sites-enabled/default
sudo ln -s /etc/nginx/sites-available/ckan /etc/nginx/sites-enabled/ckan
sudo mkdir -p /var/cache/nginx/proxycache
sudo chown www-data /var/cache/nginx/proxycache
sudo chown -R www-data:www-data /var/lib/ckan
sudo chown -R www-data:www-data /usr/lib/ckan/default/src/ckan/ckan/public
sudo supervisorctl reload
sudo service nginx restart
sudo supervisorctl status      # ต้อง RUNNING ทั้ง ckan-uwsgi:ckan-uwsgi-00 และ ckan-worker:ckan-worker-00
```

### 8.5 crontab (ทั้ง 4 บรรทัด — ตามเครื่องเดิม)
```sh
crontab -e
```
```cron
@hourly /usr/lib/ckan/default/bin/ckan -c /etc/ckan/default/ckan.ini tracking update
@daily /usr/lib/ckan/default/bin/ckan -c /etc/ckan/default/ckan.ini search-index rebuild
@daily /usr/lib/ckan/default/bin/ckan -c /etc/ckan/default/ckan.ini xloader submit all
@daily /usr/lib/ckan/default/bin/ckan -c /etc/ckan/default/ckan.ini opendstats fetch
```

### 8.6 ลบ session เก่า
```sh
sudo wget -O /etc/cron.daily/remove_old_sessions https://raw.githubusercontent.com/ckan/ckan-packaging/master/common/cron.daily/remove_old_sessions
sudo chmod u+x /etc/cron.daily/remove_old_sessions
```

---

## 9. ⚠️ ตั้ง `ckan.site_api_token` (ไม่มีในคู่มือเดิม — xloader พังถ้าไม่ทำ)

thai_gdc อ่านค่านี้จากตาราง `system_info` แล้วส่งต่อเป็น `ckanext.xloader.api_token` ตอน startup
(`plugin.py`: `config_['ckanext.xloader.api_token'] = ... get_system_info("ckan.site_api_token")`)

```sh
source /usr/lib/ckan/default/bin/activate
ckan -c /etc/ckan/default/ckan.ini user token add sysadmin newvm | tail -2
```
คัดลอก token ที่ได้ → ไปที่ **`http://<site>/ckan-admin/config`** → ใส่ในช่อง `ckan.site_api_token` → Update Config

ตรวจสอบ:
```sh
sudo -u postgres psql -d ckan_default -X -c "select key from system_info where state='active';"
# ต้องเห็น ckan.site_api_token
sudo supervisorctl restart ckan-uwsgi:* ckan-worker:*
```

> หน้า `/ckan-admin/config` ที่ thai_gdc เพิ่มช่องไว้ยังมี `ckan.site_org_address`, `ckan.site_org_contact`, `ckan.site_org_email`, `ckan.site_policy_link`, `ckan.search_background` (footer/แบนเนอร์) — **เครื่องเดิมยังไม่ได้กรอก** (ตาราง `system_info` มีแค่ key เดียว, ตาราง `gdc_configs` ว่าง) ถ้าต้องการเหมือนเดิม 100% ก็ไม่ต้องกรอก

---

## 10. สร้างโครงสร้างองค์กร / กลุ่ม / ลำดับชั้น

ใช้ API (CKAN 2.10 ไม่มี CLI สำหรับสร้าง org/group) — เตรียม token ก่อน:

```sh
export CKAN_URL=http://localhost:8080
export TOKEN='<api token ของ sysadmin จากข้อ 9>'
api() { curl -s -H "Authorization: $TOKEN" -H "Content-Type: application/json" -d "$2" "$CKAN_URL/api/3/action/$1"; echo; }
```

### 10.1 Organization (5 ตัว)

```sh
api organization_create '{"name":"trat","title":"ตราด (Trat)"}'
api organization_create '{"name":"loey","title":"เลย (Loei)"}'
api organization_create '{"name":"orga","title":"OrgA"}'
api organization_create '{"name":"sub_org_ax","title":"SubOrgAX"}'
api organization_create '{"name":"sub_org_ay","title":"SuborgAY"}'
```

### 10.2 ลำดับชั้น (ckanext-hierarchy) — `sub_org_ax`, `sub_org_ay` เป็นลูกของ `orga`

```sh
api organization_patch '{"id":"sub_org_ax","groups":[{"name":"orga"}]}'
api organization_patch '{"id":"sub_org_ay","groups":[{"name":"orga"}]}'
```
> หรือทำผ่าน UI: หน้าแก้ไข sub-organization → ช่อง **Parent** เลือก `OrgA`
> ตรวจสอบ: `http://<site>/organization` ต้องเห็น SubOrgAX/SuborgAY เยื้องอยู่ใต้ OrgA

### 10.3 Group = ภาค (6 ตัว)

```sh
api group_create '{"name":"north","title":"ภาคเหนือ"}'
api group_create '{"name":"northeast","title":"ภาคตะวันออกเฉียงเหนือ"}'
api group_create '{"name":"central","title":"ภาคกลาง"}'
api group_create '{"name":"east","title":"ภาคตะวันออก"}'
api group_create '{"name":"west","title":"ภาคตะวันตก"}'
api group_create '{"name":"south","title":"ภาคใต้"}'
```

---

## 11. สร้าง user + กำหนด role + showcase admin

### 11.1 สร้าง user (11 ตัว ไม่รวม `default` ที่ระบบสร้างเอง)

```sh
source /usr/lib/ckan/default/bin/activate
C="ckan -c /etc/ckan/default/ckan.ini"

# --- ชุด OrgA / SubOrgAX (รหัสผ่านตาม user_pass.txt เดิม) ---
$C user add organization_a_member  email=organization_a_member@bdi.or.th  password='OrgAMember@12345'
$C user add organization_a_editor  email=organization_a_editor@bdi.or.th  password='OrgAEditor@12345'
$C user add organization_a_admin   email=organization_a_admin@bdi.or.th   password='OrgAAdmin@12345'
$C user add organization_a_suborganization_x_member email=organization_a_suborganization_x_member@bdi.or.th password='OrgASubXMember@12345'
$C user add organization_a_suborganization_x_editor email=organization_a_suborganization_x_editor@bdi.or.th password='OrgASubXEditor@12345'
$C user add organization_a_suborganization_x_admin  email=organization_a_suborganization_x_admin@bdi.or.th  password='OrgASubXAdmin@12345'

# --- ชุดทดสอบจังหวัด (รหัสผ่านเดิมไม่มีบันทึกไว้ → ใช้ password1234! ตามที่ผู้ใช้ยืนยัน Q2) ---
$C user add viewer_trat email=viewer_trat@bdi.or.th password='password1234!'
$C user add admin_trat  email=admin_trat@bdi.or.th  password='password1234!'
$C user add viewer_loey email=viewer_loey@bdi.or.th password='password1234!'
$C user add member      email=member_user@bdi.or.th password='password1234!'   # user ทดสอบ showcase admin
```

> **ข้อสังเกต:** ไฟล์ `user_pass.txt` เดิมเขียนคำสั่งสร้าง user ชื่อ `orga_member`, `orga_admin` ฯลฯ (พร้อม `fullname=`) แต่ **ในระบบจริงชื่อ user คือ `organization_a_member` ฯลฯ และช่อง fullname ว่าง** คำสั่งด้านบนสะท้อนสถานะจริงในระบบ
> `user_pass.txt` ยังมี `orgb_admin` และ `orga_suby_admin` ซึ่ง **ไม่มีอยู่ในระบบจริง** (ไม่ต้องสร้าง)

### 11.2 กำหนด role ใน organization

```sh
api organization_member_create '{"id":"orga","username":"organization_a_admin","role":"admin"}'
api organization_member_create '{"id":"orga","username":"organization_a_editor","role":"editor"}'
api organization_member_create '{"id":"orga","username":"organization_a_member","role":"member"}'
api organization_member_create '{"id":"orga","username":"sysadmin","role":"admin"}'

api organization_member_create '{"id":"sub_org_ax","username":"organization_a_suborganization_x_admin","role":"admin"}'
api organization_member_create '{"id":"sub_org_ax","username":"organization_a_suborganization_x_editor","role":"editor"}'
api organization_member_create '{"id":"sub_org_ax","username":"organization_a_suborganization_x_member","role":"member"}'
api organization_member_create '{"id":"sub_org_ax","username":"sysadmin","role":"admin"}'

api organization_member_create '{"id":"sub_org_ay","username":"sysadmin","role":"admin"}'

api organization_member_create '{"id":"trat","username":"admin_trat","role":"editor"}'
api organization_member_create '{"id":"trat","username":"viewer_trat","role":"member"}'
api organization_member_create '{"id":"loey","username":"viewer_loey","role":"member"}'
```

> user `default` (site user) จะเป็น admin ของทุก org/group อัตโนมัติ ไม่ต้องทำอะไร

### 11.3 Showcase Admin (5 คน)

ทำผ่านหน้า **`http://<site>/ckan-admin/showcase_admins`** เพิ่ม user เหล่านี้:

```
organization_a_admin
organization_a_editor
organization_a_member
organization_a_suborganization_x_admin
member
```

> สิทธิ์นี้ = แก้ไข showcase ได้ **ทุกอัน** (ไม่มีสิทธิ์ราย showcase) และมีแต่ sysadmin ที่จัดการลิสต์นี้ได้

---

## 12. ข้อมูล dataset / showcase

มี 2 ทาง:

### ทาง A — ย้ายข้อมูลจริงจากเครื่องเดิม (แนะนำ ถ้าต้องการ "เหมือนเดิม" จริง ๆ)

> ⚠️ ทำได้เฉพาะเมื่อ **Q3 = ใช่ และมี SSH access เข้าเครื่องเดิมแล้ว** ถ้าไม่มี ให้ข้ามไปทาง B

ทำ **แทนข้อ 10–12** ทั้งหมด (ทำหลังข้อ 9 เสร็จ):

```sh
# --- บนเครื่องเดิม ---
sudo -u postgres pg_dump -Fc ckan_default      > /tmp/ckan_default.dump
sudo -u postgres pg_dump -Fc datastore_default > /tmp/datastore_default.dump

# --- บนเครื่องใหม่ ---
sudo supervisorctl stop all
sudo -u postgres dropdb ckan_default && sudo -u postgres createdb -O ckan_default ckan_default -E utf-8
sudo -u postgres dropdb datastore_default && sudo -u postgres createdb -O ckan_default datastore_default -E utf-8
sudo -u postgres pg_restore -d ckan_default      /tmp/ckan_default.dump
sudo -u postgres pg_restore -d datastore_default /tmp/datastore_default.dump

# ไฟล์ resource ที่อัปโหลด (~6.6 MB บนเครื่องเดิม)
rsync -av root@49.0.192.67:/var/lib/ckan/default/ /var/lib/ckan/default/
sudo chown -R www-data:www-data /var/lib/ckan

source /usr/lib/ckan/default/bin/activate
ckan -c /etc/ckan/default/ckan.ini db upgrade
ckan -c /etc/ckan/default/ckan.ini datastore set-permissions | sudo -u postgres psql --set ON_ERROR_STOP=1
ckan -c /etc/ckan/default/ckan.ini search-index rebuild
sudo supervisorctl start all
```
> ถ้า restore DB มาแล้ว **ต้องแก้ `ckan.site_url` เป็น IP ใหม่** และตรวจว่า `system_info.ckan.site_api_token` ที่ติดมากับ dump ยังใช้ได้ (token ผูกกับ `beaker.session.secret` — ถ้า secret ของ VM ใหม่ต่างกัน ต้องออก token ใหม่ตามข้อ 9)

### ทาง B — สร้างข้อมูลใหม่ด้วยมือ

ข้อมูลบนเครื่องเดิมเป็นชุดทดสอบ (ดูภาคผนวก C) ถ้าไม่ต้องการข้อมูลเดิม ให้ข้ามได้
⚠️ การสร้าง dataset ผ่าน API ต้องกรอกฟิลด์บังคับของ schema `ckanext.thai_gdc:ckan_dataset.json` ครบ (GDC metadata ~20 ฟิลด์) ทำผ่าน **UI** ง่ายกว่า

โหลดข้อมูลเข้า DataStore หลังมี resource:
```sh
ckan -c /etc/ckan/default/ckan.ini xloader submit all
```

---

## 13. Checklist ตรวจรับ (ต้องผ่านทุกข้อ)

```sh
source /usr/lib/ckan/default/bin/activate
```

| # | ตรวจอะไร | คำสั่ง / วิธี | ผลที่ต้องได้ |
|---|---|---|---|
| 1 | service ทำงาน | `sudo supervisorctl status` | ckan-uwsgi + ckan-worker = RUNNING |
| 2 | plugin โหลดครบ 22 ตัว | `grep '^ckan.plugins' /etc/ckan/default/ckan.ini` | ตรงกับข้อ 7.3 |
| 3 | nexttheme ติดตั้ง | `pip list \| grep nexttheme` | `ckanext-nexttheme 0.1.0 /root/apps/ckan` |
| 4 | patch showcase ติด | `git -C /usr/lib/ckan/default/src/ckanext-showcase diff --stat` | 2 files changed |
| 5 | patch dcat ติด | `git -C /usr/lib/ckan/default/src/ckanext-dcat diff --stat` | requirements.txt \| 2 +- |
| 6 | เวอร์ชัน extension ตรง | `for d in /usr/lib/ckan/default/src/*/; do git -C $d describe --tags 2>/dev/null; done` | ตรงตารางข้อ 1 |
| 7 | Solr ใช้ schema CKAN | `curl -s 'http://127.0.0.1:8983/solr/ckan/select?q=*:*&rows=0'` | ตอบ JSON ไม่ error |
| 8 | Solr ปิดจากภายนอก | `sudo ufw status` | มีแค่ 22/80/443 |
| 9 | หน้าเว็บขึ้น | เปิด `http://<IP>` | หน้าแรกธีม thai_gdc + footer ภาษาไทย + ตัวนับผู้เข้าชม |
| 10 | ธีม nexttheme ทำงาน | หน้า `/dataset` | การ์ด dataset แสดง "total views / recent views" + ป้ายกลุ่มสี + วันที่แบบไทย |
| 11 | facet private แปลไทย | `/dataset` sidebar | facet `private` แสดง "Private/Public" ไม่ใช่ true/false |
| 12 | search suggest ทำงาน | พิมพ์ ≥2 ตัวอักษรในช่องค้นหา | มี autocomplete (เรียก `/api/3/action/discovery_search_suggest`) |
| 13 | showcase เห็น private dataset | เปิด showcase ที่ผูก private dataset | dataset แสดง (ถ้าไม่แสดง = patch ข้อ 5 ไม่ติด) |
| 14 | hierarchy ทำงาน | `/organization` | SubOrgAX/AY อยู่ใต้ OrgA |
| 15 | xloader ทำงาน | `/ckan-admin/config` มี token + `ckan ... xloader submit all` | job สำเร็จ, resource มีแท็บ Data API |
| 16 | opendstats | `/stats` หรือ `ckan ... opendstats fetch` | ไม่ error (ตาราง `ckanext_opendstats_*` ต้องมี) |
| 17 | cron | `crontab -l` | 4 บรรทัดตามข้อ 8.5 |
| 18 | log ไม่มี error | `tail -50 /var/log/ckan/ckan-uwsgi.stderr.log` | ไม่มี traceback |

---

# ภาคผนวก A — ไฟล์ทั้งหมดของ `ckanext-nexttheme`

> snapshot จากเครื่องเดิม 17/08/2026 — ถ้ามี git repo ให้ยึด repo เป็นหลัก

### A.1 `/root/apps/ckan/setup.py` ← **ไฟล์นี้หายจากเครื่องเดิม ต้องสร้างใหม่**

```python
from setuptools import setup, find_namespace_packages

setup(
    name='ckanext-nexttheme',
    version='0.1.0',
    description='CKAN theme extension (next theme) for Thailand province portal',
    packages=find_namespace_packages(include=['ckanext.*']),
    namespace_packages=['ckanext'],
    include_package_data=True,
    zip_safe=False,
    entry_points='''
        [ckan.plugins]
        nexttheme = ckanext.nexttheme.plugin:NextThemePlugin
    ''',
)
```
> ต้องได้ entry point ตรงนี้เท่านั้น: `nexttheme = ckanext.nexttheme.plugin:NextThemePlugin`

### A.2 ไฟล์ว่าง 2 ไฟล์

```sh
mkdir -p /root/apps/ckan/ckanext/nexttheme/{assets,templates/{home,organization,snippets}}
touch /root/apps/ckan/ckanext/__init__.py
touch /root/apps/ckan/ckanext/nexttheme/__init__.py
```

### A.3 `ckanext/nexttheme/plugin.py`

```python
import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit


class NextThemePlugin(plugins.SingletonPlugin):
    plugins.implements(plugins.IConfigurer)

    def update_config(self, config_):
        toolkit.add_template_directory(config_, 'templates')
        toolkit.add_resource('assets', 'nexttheme')
```

### A.4 `ckanext/nexttheme/assets/webassets.yml`

```yaml
custom:
  contents:
    - custom.css
  output: nexttheme/custom.css
```

### A.5 `ckanext/nexttheme/assets/custom.css`

```css
/* ── nexttheme custom overrides ────────────────────────────────────────────
   Edit this file to customise the site's look.
   Changes here take effect after: sudo supervisorctl restart ckan-uwsgi:*
─────────────────────────────────────────────────────────────────────────── */

/* Example: change the top navbar colour */
/* .navbar { background-color: #05474F !important; } */
```

### A.6 `templates/base.html` — โหลด asset thai_gdc + custom.css + jQuery/jQuery-UI + autocomplete

```html
{% ckan_extends %}

{% block styles %}
  {{ super() }}
  {% include 'thai_gdc/snippets/thai_gdc_asset.html' %}
  {% asset 'nexttheme/custom' %}
{% endblock %}

{% block head_extras %}
  {{ super() }}
  <script
  src="https://code.jquery.com/jquery-3.7.1.js"
  integrity="sha256-eKhayi8LEQwp4NKxN+CfCh+3qOVUtJn3QNZ0TciWLP4="
  crossorigin="anonymous"></script>
  <script
  src="https://code.jquery.com/ui/1.14.1/jquery-ui.js"
  integrity="sha256-9zljDKpE/mQxmaR4V2cGVaQ7arF3CcXxarvgr7Sj8Uc="
  crossorigin="anonymous"></script>
  <!--<script
  src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.min.js"
  integrity="sha384-0pUGZvbkm6XF6gxjEnlmuGrJXVbNuzT9qBBavbLwCsOGabYfZo0T0to5eqruptLy"
  crossorigin="anonymous"></script>-->
{% endblock %}

{% block scripts %}
  {{ super() }}
  {% asset 'thai_gdc/thai_gdc_js' %}
  <script>
  $('.search-form input, .site-search input, .search').autocomplete({
    delay: 500,
    html: true,
    minLength: 2,
    source: function (request, response) {
      var url = ckan.SITE_ROOT + '/api/3/action/discovery_search_suggest';
      $.getJSON(url, {q: request.term})
        .done(function (data) {
          response(data['result']);
        });
      }
  });
  </script>
{% endblock %}
```

### A.7 `templates/organization/index.html` — ซ่อน pagination

```html
{% ckan_extends %}

  {% block page_pagination %}
  {% endblock %}
```

### A.8 `templates/organization/read.html` — ปุ่ม Import from template (sysadmin เท่านั้น)

```html
{% ckan_extends %}

{% block page_primary_action %}
  {% if h.check_access('package_create', {'owner_org': group_dict.id}) %}
    {% snippet 'snippets/add_dataset.html', group=group_dict.id %}
    {% if group_dict.id and c.userobj.sysadmin %}
      <a class="btn btn-primary" href="/ckan-admin/dataset-import?import_org={{ group_dict.name }}"><i class="fa fa-cloud-upload"></i> Import from template</a>
    {% endif %}
  {% endif %}
{% endblock %}
```

### A.9 `templates/snippets/facet_list.html` — แปล facet `private` เป็น Private/Public + ปุ่ม x

```html
{% ckan_extends %}

{% block facet_list_items %}
{% with items = items or h.get_facet_items_dict(name, search_facets) %}
    {% if items %}
    <nav aria-label="{{ title }}">
        <ul class="list-unstyled nav nav-simple nav-facet">
        {% for item in items %}
            {% set href = h.remove_url_param(name, item.name, extras=extras, alternative_url=alternative_url) if item.active else h.add_url_param(new_params={name: item.name}, extras=extras, alternative_url=alternative_url) %}
            {% set label = label_function(item) if label_function else item.display_name %}

            {% if name == 'private' and label == 'true' %}
                {% set label = _('Private') %}
            {% elif name == 'private' and label == 'false' %}
                {% set label = _('Public') %}
            {% endif %}

            {% set label_truncated = label|truncate(35) if not label_function else label %}
            {% set count = count_label(item['count']) if count_label else ('%d' % item['count']) %}
            <li class="nav-item {% if item.active %} active{% endif %}">
            <a href="{{ href }}" title="{{ label if label != label_truncated else '' }}">
                <span class="item-label">{{ label_truncated }}</span>
                <!--<span class="hidden separator"> - </span>-->
                <span class="item-count badge">{{ count }}</span>
                {% if item.active %}<span class="facet-close">x</span>{% endif %}
            </a>
            </li>
        {% endfor %}
        </ul>
    </nav>

    <p class="module-footer">
        {% if h.get_param_int('_%s_limit' % name) %}
        {% if h.has_more_facets(name, search_facets) %}
            <a href="{{ h.remove_url_param('_%s_limit' % name, replace=0, extras=extras, alternative_url=alternative_url) }}" class="read-more">{{ _('Show More {facet_type}').format(facet_type=title) }}</a>
        {% endif %}
        {% else %}
        <a href="{{ h.remove_url_param('_%s_limit' % name, extras=extras, alternative_url=alternative_url) }}" class="read-more">{{ _('Show Only Popular {facet_type}').format(facet_type=title) }}</a>
        {% endif %}
    </p>
    {% else %}
    <p class="module-content empty">{{ _('There are no {facet_type} that match this search').format(facet_type=title) }}</p>
    {% endif %}
{% endwith %}
{% endblock %}
```

### A.10 `templates/snippets/package_item.html` — การ์ด dataset: ยอดวิว + ป้ายกลุ่มสี + ชื่อ org + วันที่ไทย

```html
{% ckan_extends %}

{% block package_item %}
  <li class="{{ item_class or "dataset-item" }}">
    {% block content %}
      <div class="dataset-content">
        {% block heading %}
          <h2 class="dataset-heading">
            {% block heading_private %}
              {% if package.private %}
                <span class="dataset-private badge bg-secondary">
                    <i class="fa fa-lock"></i>
                    {{ _('Private') }}
                </span>
              {% endif %}
            {% endblock %}
            {% block heading_title %}
    <a href="{{ h.url_for('%s.read' % package.type, id=package.name) }}" title="{{ title }}">
      {{title|truncate(100)}}
    </a>
            {% endblock %}
            {% block heading_meta %}
              {% if package.get('state', '').startswith('draft') %}
                <span class="badge bg-info">{{ _('Draft') }}</span>
              {% elif package.get('state', '').startswith('deleted') %}
                <span class="badge bg-danger">{{ _('Deleted') }}</span>
              {% endif %}
              {% if package.tracking_summary %}
                  <span class="textRecentViews">
                    <i class="fa fa-line-chart" aria-hidden="true"></i>
                    {{package.tracking_summary.total}} total views
                  </span>
                  <span class="textRecentViews">
                    <i class="fa fa-line-chart" aria-hidden="true"></i>
                    {{package.tracking_summary.recent}} recent views
                  </span>
              {% endif %}
            {% endblock %}
          </h2>
        {% endblock %}
        <div style="text-align: right;">
            {% if package.groups %}
            <div class="blockTagSearch">
            {% for data_groups in package.groups %}
            {% set item_color = h.thai_gdc_get_group_color(data_groups.id) %}
                <a class="aNoBUnder btn" href="{{h.url_for(controller='group', action='read', id=data_groups.name)}}"
                   style="white-space: nowrap;background-color: {{item_color}};color: white;margin:0 5px 5px 0;padding: 3px;font-size:.7em;">
                    {{data_groups.title}}
                </a>
            {% endfor %}
            </div>
            {% endif %}
        </div>
        {% block notes %}
          {% if notes %}
            <div>{{ notes|urlize }}</div>
          {% else %}
            <p class="empty">{{ h.humanize_entity_type('package', package.type, 'no description') or _("There is no description for this dataset") }}</p>
          {% endif %}
        {% endblock %}
      </div>
      {% block resources %}
        {% if package.resources and not hide_resources %}
          {% block resources_outer %}
            <ul class="dataset-resources list-unstyled">
              {% block resources_inner %}
                  {% set auth_resources=[] %}
                  {% for resource in package.resources %}
                    {% if h.check_access('resource_show', {'id':resource.id }) %}
                      {%- do auth_resources.append({'format': resource.format}) -%}
                    {% endif %}
                  {% endfor %}
                {% for resource in h.dict_list_reduce(auth_resources, 'format') %}
                <li>
                  <a href="{{ h.url_for(package.type ~ '.read', id=package.name) }}" class="badge badge-default" data-format="{{ resource.lower() }}">{{ resource }}</a>
                </li>
                {% endfor %}
              {% endblock %}
            </ul>
          {% endblock %}
        {% endif %}
      {% endblock %}
    {% endblock %}
    <div style="margin-top: 8px;">
        <i class="fa fa-building" aria-hidden="true"></i>
        {{ package.organization.title }}
        <i class="fa fa-calendar" aria-hidden="true"></i>
        {{ h.thai_gdc_day_thai(h.date_str_to_datetime(package.metadata_modified)) }}
    </div>
  </li>
{% endblock %}
```

### A.11 `templates/footer.html`

```html
{% ckan_extends %}

{% block footer_content %}
      <div class="blockFooter">
          {% block footer_nav %}
           <div class="bgFooterTop">
                <div class="container">
                    <div class="row">
                        <div class="col-md-7 col-sm-7 col-xs-12">
                            <div class="row">
                                <div class="col-md-12 col-sm-12 col-xs-12">
                                    <div class="d-flex flex-row">
                                        <div><i class="fa fa-map-marker iconFooter"></i></div>
                                        <div>{{ h.render_markdown(g.site_org_address) }}</div>
                                    </div>
                                </div>

                                <div class="col-md-12 col-sm-12 col-xs-12 mt-1">
                                    <div class="d-flex flex-row">
                                            <div><i class="fa fa-phone iconFooter"></i></div>
                                            <div>{{ h.render_markdown(g.site_org_contact) }}</div>
                                    </div>
                                </div>
                                <div class="col-md-12 col-sm-12 col-xs-12 mt-1">
                                    <div class="d-flex flex-row">
                                            <div><i class="fa fa-envelope iconFooter"></i></div>
                                            <div>{{ h.render_markdown(g.site_org_email) }}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-5 col-sm-5 col-xs-12">
                            <div class="row">
                                {% block footer_attribution %}
                                <div class="d-flex flex-row-reverse">
                                    <span>
                                        จำนวนผู้เข้าชม <span class="totalVisitor">{{ h.thai_gdc_get_stat_all_view() }}<!-- at {{ h.thai_gdc_get_last_update_tracking() }} --></span>
                                    </span>
                                </div>
                                <div style="display: flex; justify-content: flex-end">
                                    {{ h.render_markdown(g.site_policy_link) }}
                                </div>
                                {% block footer_lang %}
                                    {% snippet "snippets/language_selector.html" %}
                                {% endblock %}
                                <div class="col-md-12 col-sm-12 col-xs-12" style="display: flex;justify-content: space-between;padding-left: 0px;margin-top: 10px;">
                                    <span><span style="font-weight: bold;vertical-align: bottom;margin-right: 5px;">Powered by:</span><a class="hide-text ckan-footer-logo" href="http://ckan.org" target="_blank" style="padding-right: 5px;"><img alt="CKAN logo" src="/base/images/ckan-logo-footer.png"></a>
                                        <a href="https://gitlab.nectec.or.th/opend/installing-ckan/-/blob/master/README.md" target="_blank"><img alt="OpenD logo" src="/base/images/logo-opend.png" style="width: 50px;opacity: 0.8;"></a>
                                        <br/>
                                        <span style="font-weight: bold;vertical-align: bottom;margin-right: 5px;line-height: 2;">สนับสนุนระบบ Thai-GDC โดย สำนักงานสถิติแห่งชาติ</span>
                                        <br/>
                                        <table style="font-weight: bold;"><tr><td style="padding-right: 5px;">เว็บไซต์ที่เกี่ยวข้อง:</td><td><a href="https://gdcatalog.go.th"><img alt="GDCatalog logo" src="https://gdcatalog.go.th/assets/images/popup/icon/external-link_white.png" style="height: 16px;vertical-align: text-top;"> ระบบบัญชีข้อมูลภาครัฐ</a></td></tr>
                                                                                                                                            <tr><td></td><td><a href="https://directory.gdcatalog.go.th"><img alt="GDCatalog logo" src="https://gdcatalog.go.th/assets/images/popup/icon/external-link_white.png" style="height: 16px;vertical-align: text-top;"> บริการนามานุกรมบัญชีข้อมูลภาครัฐ</a></td></tr></table>
                                    </span>
                                <span>
                                    <small style="vertical-align: sub;color: #ffffff;">รุ่นโปรแกรม: {{h.thai_gdc_get_extension_version('version')}}</small><br/>
                                    <small style="vertical-align: sub;line-height: 2.6;color: #ffffff;">วันที่: {{h.thai_gdc_get_extension_version('date')}}</small>
                                </span>
                                </div>
                                {% endblock %}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
          {% endblock %}
      </div>
      <div id="cookieNotice" class="myDiv" style="z-index: 99 !important;display: none;">
        <div id="closeIcon" style="display: none;">
        </div>
        <div class="content-wrap">
            <div class="msg-wrap">
                <p class="txt-cookie">เว็บไซต์นี้ใช้ "คุกกี้" เพื่อวัตถุประสงค์ในการพัฒนาการเข้าถึงบริการของผู้ใช้ให้ดียิ่งขึ้น หากต้องการเปิดใช้งานคุกกี้ โปรดคลิก "ยอมรับคุกกี้"</p>
                <p class="txt-cookie">คุณสามารถถอนการยินยอมของคุณได้ตลอดเวลา โดยไปที่ "การตั้งค่าคุกกี้"</p>
                <div class="btn-wrap">
                    <button class="btn-primary" onclick="acceptCookieConsent();">ยอมรับคุกกี้</button>
                </div>
                <div class="close-cookies" onclick="closeCookieConsent();">x</div>
            </div>
        </div>
      </div>
      {% endblock %}
```

### A.12 `templates/home/index.html` — popup event modal

```html
{% ckan_extends %}

{% block content %}
{{ super() }}
{% set event_conf = h.thai_gdc_get_conf_group('EVENT') %}
{% if event_conf.EVENT_PUBLIC and event_conf.EVENT_PUBLIC == 'True' %}

{% if event_conf.EVENT_IMAGE %}
<style>
button.close {
    border: 0;
}
.close {
    float: right;
    font-size: 21px;
    font-weight: 700;
    line-height: 1;
    opacity: .2;
}
</style>
<div class="modal fade" id="homeEventModal">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header" style="display: block;">
        <button type="button" class="close" data-bs-dismiss="modal">&times;</button>
      </div>
      <div class="modal-body">
        <img src="{{event_conf.EVENT_IMAGE}}" style="width:100%" alt="event popup banner image">
      </div>
      {% if event_conf.EVENT_URL and event_conf.EVENT_URL != '' %}
      <div class="modal-footer">
        <a href="{{event_conf.EVENT_URL}}" class="btn btn-success" target="_blank">
          {{event_conf.EVENT_TEXT if event_conf.EVENT_TEXT else 'เพิ่มเติม'}}
        </a>
      </div>
      {% endif %}
    </div>
  </div>
</div>
<script>
  $(window).on('load', function() {
        $('#homeEventModal').modal('show');
    });
</script>
{% endif %}
{% endif %}
{% endblock %}
```

### A.13 `templates/home/layout1.html`

```html
{% if g.search_background %}
  {% set background = g.search_background %}
{% else %}
  {% set background = '/base/images/bg-banner.jpg' %}
{% endif %}

<div role="main">
  <div class="main hero" style="background-image: url('{{ background }}');">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          {% block promoted %}
            {% snippet 'home/snippets/promoted.html' %}
          {% endblock %}
        </div>
        <div class="col-md-6">
          {% block search %}
            {% snippet 'home/snippets/search.html', search_facets=search_facets %}
          {% endblock %}
          {% block stats %}
            {% snippet 'home/snippets/stats.html' %}
          {% endblock %}
        </div>
      </div>
    </div>
  </div>

  <div class="main module-feeds">
    <div class="container">
      {% block featured_group %}
        {% if h.thai_gdc_get_use_gd_multigroup() and h.thai_gdc_get_group_schemas() != '' %}
        {% set category_dict = h.scheming_group_schemas() %}
        {% endif %}
        {% if category_dict and category_dict.keys()|length %}
          <div class="row module-content box" style="margin: 3px;margin-bottom: 15px;">
          {% snippet 'home/snippets/multi_groups.html', category_dict=category_dict %}
          </div>
        {% else %}
          {% set stats = h.get_site_statistics() %}
          <div class="row">
          {% snippet 'home/snippets/groups.html', stats=stats %}
          </div>
        {% endif %}
      {% endblock %}
    </div>
  </div>
</div>
```

### A.14 `templates/home/layout2.html`

```html
{% if g.search_background %}
  {% set background = g.search_background %}
{% else %}
  {% set background = '/base/images/bg-banner.jpg' %}
{% endif %}

<div role="main">
  <div class="main hero" style="background-image: url('{{ background }}');">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          {% block promoted %}
            {% snippet 'home/snippets/promoted.html' %}
          {% endblock %}
        </div>
        <div class="col-md-6">
          {% block search %}
            {% snippet 'home/snippets/search.html', search_facets=search_facets %}
          {% endblock %}
        </div>
      </div>
    </div>
  </div>

  <div class="main module-feeds">
    <div class="container">
        {% block featured_group %}
          {% if h.thai_gdc_get_use_gd_multigroup() and h.thai_gdc_get_group_schemas() != '' %}
          {% set category_dict = h.scheming_group_schemas() %}
          {% endif %}
          {% if category_dict and category_dict.keys()|length %}
            <div class="row module-content box" style="margin: 3px;margin-bottom: 15px;">
            {% snippet 'home/snippets/multi_groups.html', category_dict=category_dict %}
            </div>
          {% else %}
            {% set stats = h.get_site_statistics() %}
            <div class="row">
            {% snippet 'home/snippets/groups.html', stats=stats %}
            </div>
          {% endif %}
        {% endblock %}
    </div>
  </div>
</div>
```

### A.15 `templates/home/layout3.html` — เพิ่มบล็อก "ชุดข้อมูลที่ปรับปรุงล่าสุด / เข้าชมสูงสุด"

```html
{% if g.search_background %}
  {% set background = g.search_background %}
{% else %}
  {% set background = '/base/images/bg-banner.jpg' %}
{% endif %}

<div role="main">
  <div class="main hero" style="background-image: url('{{ background }}');">
    <div class="container">
      <div class="row">
        <div class="col-md-6">
          {% block promoted %}
            {% snippet 'home/snippets/promoted.html' %}
          {% endblock %}
        </div>
        <div class="col-md-6">
          {% block search %}
            {% snippet 'home/snippets/search.html', search_facets=search_facets %}
          {% endblock %}
          {% block stats %}
            {% snippet 'home/snippets/stats.html' %}
          {% endblock %}
        </div>
      </div>
    </div>
  </div>

  <div class="main module-feeds">
    <div class="container">
        {% block featured_group %}
          {% if h.thai_gdc_get_use_gd_multigroup() and h.thai_gdc_get_group_schemas() != '' %}
          {% set category_dict = h.scheming_group_schemas() %}
          {% endif %}
          {% if category_dict and category_dict.keys()|length %}
            <div class="row module-content box" style="margin: 3px;margin-bottom: 15px;">
            {% snippet 'home/snippets/multi_groups.html', category_dict=category_dict %}
            </div>
          {% else %}
            {% set stats = h.get_site_statistics() %}
            <div class="row" style="padding-bottom: 15px;">
            {% snippet 'home/snippets/groups.html', stats=stats %}
            </div>
          {% endif %}
        {% endblock %}
      <div class="row module-content box" style="margin: 3px">
        <div class="col-md-6">
          <div class="col-md-12" style="padding: 0px 0px 5px 0px;">
            <div class="textHeadBorderMiddle">
                <h3>ชุดข้อมูลที่ปรับปรุงล่าสุด</h3>
            </div>
          </div>
          {% block last_modified_datasets %}
          {% set last_modified_datasets = h.thai_gdc_get_last_modified_datasets(5) %}
          {% snippet 'home/snippets/last_modified_datasets.html', datasets = last_modified_datasets %}
          {% endblock %}
        </div>
        <div class="col-md-6">
          <div class="col-md-12" style="padding: 0px 0px 5px 0px;">
            <div class="textHeadBorderMiddle">
                <h3>ชุดข้อมูลที่มีการเข้าชมสูงสุด</h3>
            </div>
          </div>
          {% block top_view_datasets %}
          {% set top_view_datasets = h.thai_gdc_get_popular_datasets(5) %}
          {% snippet 'home/snippets/top_view_datasets.html', datasets = top_view_datasets %}
          {% endblock %}
        </div>
      </div>
    </div>
  </div>
</div>
```

> `home/layout1-3.html` เป็นไฟล์ที่ **ไม่มี `{% ckan_extends %}`** (แทนที่ทั้งไฟล์) — เลือกใช้ตัวไหนขึ้นกับ `ckan.homepage_style` ใน `ckan.ini` (เครื่องเดิม = `1`)

---

# ภาคผนวก B — ค่าที่ thai_gdc บังคับ override ตอน startup (แก้ `ckan.ini` ไม่มีผล)

จาก `src/ckanext-thai-gdc/ckanext/thai_gdc/plugin.py` (`update_config`) — ต้องรู้ไว้ ไม่ต้องแก้อะไร:

| Config | ค่าใน `ckan.ini` | ค่าจริงตอนรัน |
|---|---|---|
| `ckan.tracking_enabled` | false | **True** |
| `ckan.locale_default` | en | **th** |
| `ckan.datasets_per_page` | 20 | **30** |
| `ckan.jobs.timeout` | 180 | **3600** |
| `ckan.group_and_organization_list_all_fields_max` | 25 | **1000** |
| `ckan.datastore.search.rows_max` | – | **10000** |
| `ckan.auth.user_create_groups` | true | **False** |
| `ckan.auth.user_create_organizations` | true | **False** |
| `ckan.auth.user_delete_groups` | true | **False** |
| `ckan.auth.user_delete_organizations` | true | **False** |
| `ckan.auth.public_user_details` | true | **False** |
| `ckan.auth.reveal_private_datasets` | false | **True** |
| `search.facets` | organization groups tags res_format license_id | **+ data_type, data_category, data_classification, private** |
| `ckanext.xloader.api_token` | – | ค่าจาก `system_info['ckan.site_api_token']` (ข้อ 9) |

thai_gdc ยัง override auth function 5 ตัว: `member_create`, `resource_show`, `package_delete`, `resource_delete`, `resource_view_reorder`

---

# ภาคผนวก C — ข้อมูลที่มีอยู่บนเครื่องเดิม (สำหรับตรวจเทียบ)

### Organization (5)
| name | title | parent |
|---|---|---|
| `trat` | ตราด (Trat) | – |
| `loey` | เลย (Loei) | – |
| `orga` | OrgA | – |
| `sub_org_ax` | SubOrgAX | **orga** |
| `sub_org_ay` | SuborgAY | **orga** |

### Group (6): `north` ภาคเหนือ, `northeast` ภาคตะวันออกเฉียงเหนือ, `central` ภาคกลาง, `east` ภาคตะวันออก, `west` ภาคตะวันตก, `south` ภาคใต้

### User + role (12 รวม `default`)
| user | sysadmin | org / role |
|---|---|---|
| `default` (site user) | ✅ | admin ทุก org/group (อัตโนมัติ) |
| `sysadmin` | ✅ | orga=admin, sub_org_ax=admin, sub_org_ay=admin |
| `organization_a_admin` | – | orga=**admin** |
| `organization_a_editor` | – | orga=**editor** |
| `organization_a_member` | – | orga=**member** |
| `organization_a_suborganization_x_admin` | – | sub_org_ax=**admin** |
| `organization_a_suborganization_x_editor` | – | sub_org_ax=**editor** |
| `organization_a_suborganization_x_member` | – | sub_org_ax=**member** |
| `admin_trat` | – | trat=**editor** |
| `viewer_trat` | – | trat=**member** |
| `viewer_loey` | – | loey=**member** |
| `member` (fullname `member_user@bdi.or.th`) | – | ไม่มี org |

### Showcase Admin (5): `organization_a_admin`, `organization_a_editor`, `organization_a_member`, `organization_a_suborganization_x_admin`, `member`

### Dataset (7 active + 1 deleted)
| name | org | private | resource |
|---|---|---|---|
| `trat-sample-data` (ชุดข้อมูลสุ่มตราด) | trat | ✅ | CSV upload · อยู่ในกลุ่ม `east` |
| `loei-opendata` (ชุดเปิด loei) | loey | – | CSV upload |
| `org_admin_a` | orga | ✅ | CSV upload |
| `sub_org_ax` | sub_org_ax | ✅ | CSV upload |
| `testdeletion` | sub_org_ax | ✅ | CSV upload |
| `sub_org_ay-dataset` | sub_org_ay | ✅ | CSV upload |
| `test001` | orga | ✅ | **state=deleted** |

### Showcase (2)
| showcase | dataset ที่ผูก |
|---|---|
| `sampdb101` (ตัวอย่างเล่นๆ) | trat-sample-data, org_admin_a, testdeletion, sub_org_ay-dataset |
| `scorga` (scorgA) | loei-opendata, org_admin_a, testdeletion |

> showcase ทั้งสองผูก **private dataset** เป็นหลัก → เป็นเหตุผลของ patch ข้อ 5

### Tag: `asd`, `Education`, `V(220101) กฎหมายกับการพัฒนาภาครัฐและภาคเอกชน`, `น้อย`, `มาก`
### Storage: `/var/lib/ckan/default` ≈ 6.6 MB (resources / storage / webassets)
### DataStore: 6 ตารางใน `datastore_default`

---

# ภาคผนวก D — คำสั่งดำเนินการประจำวัน

```sh
source /usr/lib/ckan/default/bin/activate
```
| งาน | คำสั่ง |
|---|---|
| ดูสถานะ service | `sudo supervisorctl status` |
| reload หลังแก้ config | `sudo supervisorctl reload` |
| restart เฉพาะ CKAN | `sudo supervisorctl restart ckan-uwsgi:* ckan-worker:*` |
| แก้ CSS/template ของ nexttheme แล้วให้มีผล | `sudo supervisorctl restart ckan-uwsgi:*` |
| rebuild search index | `ckan -c /etc/ckan/default/ckan.ini search-index rebuild` |
| โหลดข้อมูลเข้า DataStore | `ckan -c /etc/ckan/default/ckan.ini xloader submit all` |
| ดึงสถิติ opendstats | `ckan -c /etc/ckan/default/ckan.ini opendstats fetch` |
| อัปเดต page view | `ckan -c /etc/ckan/default/ckan.ini tracking update` |
| ดู log | `tail -f /var/log/ckan/ckan-uwsgi.stderr.log` |

---

## ⚠️ ข้อควรระวัง 5 ข้อสำหรับ VM ใหม่

1. **`setup.py` ของ nexttheme หายจาก repo เดิม** — ต้องสร้างก่อน `pip install -e /root/apps/ckan` (ภาคผนวก A.1)
2. **patch showcase ต้องทำหลัง `pip install -e` ทุกครั้ง** — ถ้า reinstall/อัปเดต extension patch จะหาย ควร commit เป็น branch ใน repo หรือเก็บไฟล์ `.patch` ไว้
3. **`ckan.site_api_token`** ถ้าไม่ตั้ง xloader จะ push เข้า DataStore ไม่ได้ (ไม่มี error ชัดเจนในหน้าเว็บ ดูใน log อย่างเดียว)
4. **`ckan.site_url`** ต้องเปลี่ยนเป็น IP/domain ของ VM ใหม่ ไม่ใช่ `49.0.192.67`
5. **รหัสผ่านทั้งหมดในคู่มือนี้เป็นรหัสของเครื่องทดสอบ** (`password1234!`, `Org*@12345`) — ผู้ใช้ยืนยันแล้วว่า VM ใหม่ให้ใช้ชุดเดิม (Q2) แต่ถ้าวันไหนขึ้น production ควรเปลี่ยนทั้งชุด (DB role, sysadmin, user ทุกคน) และเอา `user_pass.txt` ออกจาก git

---

*จัดทำจากการตรวจสอบเครื่อง `49.0.192.67` โดยตรง: git status/diff ของทุก extension, `ckan.ini` ที่ใช้งานจริง, `pip list`, ตาราง `system_info`/`group`/`user`/`member`/`package`/`showcase_admin`, crontab, supervisor/nginx/ufw config — 17 สิงหาคม 2026*
