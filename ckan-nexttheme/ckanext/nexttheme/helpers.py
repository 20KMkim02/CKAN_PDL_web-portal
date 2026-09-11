import ckan.plugins.toolkit as toolkit

# mapping ตายตัว: org slug (ชื่อจริงใน CKAN, เช็คผ่าน organization_list) -> ภาค
# ต้องมาเติม/แก้ทุกครั้งที่ onboard จังหวัดใหม่เข้าระบบ
PROVINCE_REGION_MAP = {
    # ภาคเหนือ
    "เชียงราย": "เหนือ",
    "น่าน": "เหนือ",
    "พะเยา": "เหนือ",
    "เชียงใหม่": "เหนือ",
    "แม่ฮ่องสอน": "เหนือ",
    "แพร่": "เหนือ",
    "ลำปาง": "เหนือ",
    "ลำพูน": "เหนือ",
    "อุตรดิตถ์": "เหนือ",

    # ภาคกลาง
    "กรุงเทพมหานคร": "กลาง",
    "พิษณุโลก": "กลาง",
    "สุโขทัย": "กลาง",
    "เพชรบูรณ์": "กลาง",
    "พิจิตร": "กลาง",
    "กำแพงเพชร": "กลาง",
    "นครสวรรค์": "กลาง",
    "ลพบุรี": "กลาง",
    "ชัยนาท": "กลาง",
    "อุทัยธานี": "กลาง",
    "สิงห์บุรี": "กลาง",
    "อ่างทอง": "กลาง",
    "สระบุรี": "กลาง",
    "พระนครศรีอยุธยา": "กลาง",
    "สุพรรณบุรี": "กลาง",
    "นครนายก": "กลาง",
    "ปทุมธานี": "กลาง",
    "นนทบุรี": "กลาง",
    "นครปฐม": "กลาง",
    "สมุทรปราการ": "กลาง",
    "สมุทรสาคร": "กลาง",
    "สมุทรสงคราม": "กลาง",

    # ภาคตะวันออกเฉียงเหนือ
    "หนองคาย": "ตะวันออกเฉียงเหนือ",
    "นครพนม": "ตะวันออกเฉียงเหนือ",
    "สกลนคร": "ตะวันออกเฉียงเหนือ",
    "อุดรธานี": "ตะวันออกเฉียงเหนือ",
    "หนองบัวลำภู": "ตะวันออกเฉียงเหนือ",
    "เลย": "ตะวันออกเฉียงเหนือ",
    "มุกดาหาร": "ตะวันออกเฉียงเหนือ",
    "กาฬสินธุ์": "ตะวันออกเฉียงเหนือ",
    "ขอนแก่น": "ตะวันออกเฉียงเหนือ",
    "อำนาจเจริญ": "ตะวันออกเฉียงเหนือ",
    "ยโสธร": "ตะวันออกเฉียงเหนือ",
    "ร้อยเอ็ด": "ตะวันออกเฉียงเหนือ",
    "มหาสารคาม": "ตะวันออกเฉียงเหนือ",
    "ชัยภูมิ": "ตะวันออกเฉียงเหนือ",
    "นครราชสีมา": "ตะวันออกเฉียงเหนือ",
    "บุรีรัมย์": "ตะวันออกเฉียงเหนือ",
    "สุรินทร์": "ตะวันออกเฉียงเหนือ",
    "ศรีสะเกษ": "ตะวันออกเฉียงเหนือ",
    "อุบลราชธานี": "ตะวันออกเฉียงเหนือ",

    # ภาคตะวันออก
    "สระแก้ว": "ตะวันออก",
    "ปราจีนบุรี": "ตะวันออก",
    "ฉะเชิงเทรา": "ตะวันออก",
    "ชลบุรี": "ตะวันออก",
    "ระยอง": "ตะวันออก",
    "จันทบุรี": "ตะวันออก",
    "ตราด": "ตะวันออก",

    # ภาคตะวันตก
    "ตาก": "ตะวันตก",
    "กาญจนบุรี": "ตะวันตก",
    "ราชบุรี": "ตะวันตก",
    "เพชรบุรี": "ตะวันตก",
    "ประจวบคีรีขันธ์": "ตะวันตก",

    # ภาคใต้
    "ชุมพร": "ใต้",
    "ระนอง": "ใต้",
    "สุราษฎร์ธานี": "ใต้",
    "นครศรีธรรมราช": "ใต้",
    "กระบี่": "ใต้",
    "พังงา": "ใต้",
    "ภูเก็ต": "ใต้",
    "พัทลุง": "ใต้",
    "ตรัง": "ใต้",
    "ปัตตานี": "ใต้",
    "สงขลา": "ใต้",
    "สตูล": "ใต้",
    "นราธิวาส": "ใต้",
    "ยะลา": "ใต้",
}

REGIONS = ['เหนือ', 'ตะวันออกเฉียงเหนือ', 'กลาง', 'ใต้', 'ตะวันตก', 'ตะวันออก']
TAG_FACET_LIMIT = 8


def _region_by_org_slug():
    """สร้าง {org_slug: region} จาก organization ที่มีอยู่จริงในระบบตอนนี้

    บั๊กเดิม: _orgs_in_region() เอา "คีย์" ของ PROVINCE_REGION_MAP (ชื่อจังหวัดภาษาไทย
    เช่น "เชียงราย") ไปใช้เป็น org slug ตรงๆ ใน fq=organization:(...) แต่ slug จริงใน
    CKAN ไม่ใช่ชื่อไทย (เช่น จังหวัดเชียงราย organization slug จริงคือ "cri" ไม่ใช่
    "เชียงราย") Solr เลยหาไม่เจอเลยสักจังหวัดเดียว ทุกการ์ดถึงว่างตลอด แก้โดย query
    organization_list จริงมาก่อน แล้วจับคู่ "title" ของแต่ละ org กับคีย์ใน
    PROVINCE_REGION_MAP แทน (ตัดส่วนในวงเล็บออกก่อนเทียบ เพราะบาง org ในระบบมี title
    แบบ "ตราด (Trat)" ไม่ใช่ "ตราด" เฉยๆ)
    """
    orgs = toolkit.get_action('organization_list')({}, {'all_fields': True})
    mapping = {}
    for org in orgs:
        base_title = org['title'].split('(')[0].strip()
        region = PROVINCE_REGION_MAP.get(base_title)
        if region:
            mapping[org['name']] = region
    return mapping


def _orgs_in_region(region, region_lookup):
    return [slug for slug, r in region_lookup.items() if r == region]


def _top_org_in_region(region, region_lookup):
    org_slugs = _orgs_in_region(region, region_lookup)
    if not org_slugs:
        return None
    fq = 'organization:(%s)' % ' OR '.join(org_slugs)
    result = toolkit.get_action('package_search')(
        {}, {'rows': 0, 'fq': fq, 'facet.field': ['organization']})
    items = result.get('search_facets', {}).get('organization', {}).get('items', [])
    return items[0] if items else None   # Solr คืนเรียงตาม count มาก->น้อยอยู่แล้ว


def _card_for_org(org_slug, region, dataset_count):
    org = toolkit.get_action('organization_show')({}, {'id': org_slug})
    result = toolkit.get_action('package_search')(
        {}, {
            'rows': 1,
            'fq': 'organization:%s' % org_slug,
            'facet.field': ['tags'],
            'facet.limit': TAG_FACET_LIMIT,
            'sort': 'metadata_modified desc',
        })
    tag_items = result.get('search_facets', {}).get('tags', {}).get('items', [])
    last_updated = result['results'][0]['metadata_modified'] if result.get('results') else None
    return {
        'region': region,
        'org_name': org_slug,
        'org_title': org.get('title') or org.get('name'),
        'dataset_count': dataset_count,
        'tags': [(t['name'], t['count']) for t in tag_items],
        'last_updated': last_updated,
    }


def get_province_cards_data():
    region_lookup = _region_by_org_slug()   # เรียก organization_list แค่ครั้งเดียว ไม่ใช่วนซ้ำทุกภาค
    cards = []
    for region in REGIONS:
        top = _top_org_in_region(region, region_lookup)
        cards.append(_card_for_org(top['name'], region, top['count']) if top else None)
    return cards
