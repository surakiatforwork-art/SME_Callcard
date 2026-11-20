# SME Callcard Studio — standalone HTML + Apps Script

## 1. Google Apps Script
- เปิด Google Sheet: https://docs.google.com/spreadsheets/d/1cDZyDu6UTNSuQYsHbQkxPv2gj7lYunbrVnYKnIKUffE/edit
- Extensions → Apps Script → วางเนื้อหา `Code.gs` ทับในไฟล์ Code.gs → Save
- Deploy → New deployment → Web app; Execute as **Me**, Who has access **Anyone** (สาธารณะเฉพาะข้อมูลสินค้าและราคาใน API)
- Authorize ครั้งแรก แล้วคัดลอก URL `/exec`

## 2. HTML หน้าเว็บ
- เปิดไฟล์ `index.html` ในเบราว์เซอร์ หรืออัปโหลดไฟล์นี้เป็น `index.html` ไปยัง Vercel (Static site)
- วาง URL `/exec` ที่ช่อง Google Apps Script API URL แล้วกด เชื่อมต่อ
- เลือก **แบบที่ 1 AppSheet** (38 สินค้า ณ 20 พ.ย. 2026) หรือ **แบบที่ 2 ประเภทสินค้า** (36 สินค้า)
- แสดงตัวอย่างด้านล่าง และกด ส่งออก / พิมพ์ เพื่อดาวน์โหลด PDF หรือพิมพ์

## 3. Data rules
- API อ่านแท็บ `Products` เท่านั้น ไม่แก้ไขข้อมูล
- สินค้า `active=FALSE` จะไม่ออก API และไม่อยู่ในเอกสารใด ๆ
- `include_appsheet` / `include_category` ควบคุมว่ารวมในแบบใด
- `sort_appsheet` / `sort_category` ควบคุมลำดับแต่ละแบบ
- barcode, price_thb, pk ใช้ค่าจากแถวเดียว ไม่คัดลอกข้อมูลแยกระหว่างสองแบบ
- ครีมสมูทอี (เขียว) 10 g. (5007386) และ ซัน ซีโร่ (5013078) ปิดใช้งานแล้ว

## หมายเหตุ
- โหมด 4 ใบต่อ A4 ใช้คอลัมน์ 4 ช่องบน A4 แนวนอน และ 1 ใบต่อ A4 ใช้เต็มแผ่น
- เมื่อตารางยาวเกิน 40 รายการ จะขึ้นหน้าใหม่ ไม่ตัดรายการทิ้ง
- ใช้ไลบรารี CDN สำหรับดาวน์โหลด PDF; ต้องเชื่อมต่ออินเทอร์เน็ต
- หน้าเว็บอ่านข้อมูลจาก public JSONP API; ใครมี URL สามารถอ่านชื่อสินค้า/ราคาได้ อย่าใส่ข้อมูลลับใน Products
- ต้องเลือกกระดาษ A4 แนวนอนและ Scale 100% ในหน้าต่างพิมพ์ ปิด Headers/Footers
- แนะนำทดสอบพิมพ์จริงก่อนใช้กับงานสาขา เนื่องจากเบราว์เซอร์/ฟอนต์/เครื่องพิมพ์ต่างกัน
