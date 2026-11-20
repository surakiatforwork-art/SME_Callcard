/** SME Callcard — read-only public catalog API (Google Apps Script)
 * Paste into Extensions → Apps Script of the Catalog spreadsheet, then deploy Web app.
 * Execute as: Me; Access: Anyone. This endpoint exposes active product names/prices publicly.
 */
const SPREADSHEET_ID = '1cDZyDu6UTNSuQYsHbQkxPv2gj7lYunbrVnYKnIKUffE';
const PRODUCT_SHEET = 'Products';
const SETTINGS_SHEET = 'Settings';
const API_VERSION = '1.2';

function doGet(e) {
  const params = (e && e.parameter) || {};
  let response;
  try {
    const action = params.action || 'catalog';
    if (action === 'health') {
      response = {ok:true,version:API_VERSION,serverTime:new Date().toISOString()};
    } else if (action === 'catalog') {
      response = catalog_(params);
    } else {
      response = {ok:false,error:'Unknown action'};
    }
  } catch (err) {
    console.error(err);
    response = {ok:false,error:'Unable to read catalog'};
  }
  const json = JSON.stringify(response);
  const callback = String(params.callback || '');
  // JSONP avoids the Apps Script cross-origin redirect/CORS limitations.
  if (callback && /^[A-Za-z_$][A-Za-z0-9_$.]{0,100}$/.test(callback)) {
    return ContentService.createTextOutput(`${callback}(${json});`)
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

function catalog_(params) {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  const sheet = ss.getSheetByName(PRODUCT_SHEET);
  if (!sheet) throw new Error('Products sheet not found');
  const all = sheet.getDataRange().getValues();
  const headers = all.shift().map(v=>String(v).trim().toLowerCase());
  const lookup = Object.fromEntries(headers.map((key,i)=>[key,i]));
  const required = ['id','name_th','brand','barcode','price_thb','pk','active','sort_order','tag'];
  for (const key of required) if (lookup[key] === undefined) throw new Error('Missing column '+key);
  const val = (row,key)=>row[lookup[key]];
  const isActive = v => v === true || v === 1 || ['true','yes','1','ใช่'].includes(String(v).trim().toLowerCase());
  const items=all.filter(row=>String(val(row,'name_th')||'').trim() && isActive(val(row,'active'))).map(row=>({
    id:String(val(row,'id')||''),
    name:String(val(row,'name_th')||'').trim(),
    brand:String(val(row,'brand')||'').trim(),
    barcode:String(val(row,'barcode')||'').trim(),
    price:val(row,'price_thb') === '' ? null : Number(val(row,'price_thb')),
    pk:val(row,'pk') === '' ? null : Number(val(row,'pk')),
    order:Number(val(row,'sort_order'))||9999,
    orderAppsheet:Number(val(row,'sort_appsheet'))||9999,
    orderCategory:Number(val(row,'sort_category'))||9999,
    includeAppsheet:isActive(val(row,'include_appsheet')),
    includeCategory:isActive(val(row,'include_category')),
    category:String(val(row,'category')||'').trim(),
    tag:String(val(row,'tag')||'').trim()
  })).sort((a,b)=>a.order-b.order || a.name.localeCompare(b.name,'th'));
  const mode = String(params.mode || '').toLowerCase();
  const visibleItems = mode === 'appsheet' ? items.filter(x=>x.includeAppsheet).sort((a,b)=>a.orderAppsheet-b.orderAppsheet) : mode === 'category' ? items.filter(x=>x.includeCategory).sort((a,b)=>a.orderCategory-b.orderCategory) : items;
  const settingsSheet=ss.getSheetByName(SETTINGS_SHEET);
  const settings={};
  if (settingsSheet && settingsSheet.getLastRow()>1) {
    settingsSheet.getRange(2,1,settingsSheet.getLastRow()-1,2).getValues().forEach(([k,v])=>{
      if (String(k).trim()) settings[String(k).trim()]=v;
    });
  }
  return {ok:true,version:API_VERSION,updatedAt:new Date().toISOString(),items:visibleItems,settings};
}
