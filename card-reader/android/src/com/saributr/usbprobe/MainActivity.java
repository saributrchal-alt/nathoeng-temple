package com.saributr.usbprobe;
import android.app.*;
import android.os.*;
import android.content.*;
import android.content.pm.PackageManager;
import android.hardware.usb.*;
import android.graphics.Color;
import android.view.*;
import android.widget.*;
import java.util.*;
public class MainActivity extends Activity {
 private UsbManager manager; private LinearLayout list; private TextView status;
 private final Map<String,String> results=new HashMap<>();
 private final String action="com.saributr.usbprobe.PERMISSION";
 private ThaiCard.Data cardData;private byte[] pendingExport;private long cardReadAt;
 private EditText desktopIp,desktopCode;
 private String webToken; private long webRequestedAt;
 private boolean webReadRequested,webPermissionRequested;
 private boolean registered; private boolean busy; private int generation; private Thread worker;
 private final BroadcastReceiver receiver=new BroadcastReceiver(){public void onReceive(Context c,Intent i){
  if(action.equals(i.getAction())){
   // Query the current permission rather than trusting broadcast extras.
   for(UsbDevice d:manager.getDeviceList().values()) if(manager.hasPermission(d)) test(d);
   status.setText("ตรวจสิทธิ์แล้ว หากยังไม่ได้อนุญาต กดปุ่มของอุปกรณ์เพื่อลองอีกครั้ง");
   if(webToken!=null)beginWebRead();
  }else if(UsbManager.ACTION_USB_DEVICE_DETACHED.equals(i.getAction())){
   generation++; if(worker!=null)worker.interrupt(); busy=false; cardData=null;cardReadAt=0; stopService(new Intent(MainActivity.this,CardHandoffService.class)); results.clear(); status.setText("มีอุปกรณ์ถูกถอด • ตรวจรายการใหม่แล้ว");
  }else{status.setText("ตรวจพบการเปลี่ยนแปลง USB");}
  refresh();
 }};
 @Override public void onCreate(Bundle b){super.onCreate(b);manager=(UsbManager)getSystemService(USB_SERVICE);
  LinearLayout root=new LinearLayout(this);root.setOrientation(1);root.setPadding(24,20,24,20);root.setBackgroundColor(Color.rgb(247,245,238));root.setFitsSystemWindows(true);
  if(Build.VERSION.SDK_INT>=30)root.setOnApplyWindowInsetsListener((v,insets)->{android.graphics.Insets x=insets.getInsets(WindowInsets.Type.systemBars());v.setPadding(24+x.left,20+x.top,24+x.right,20+x.bottom);return insets;});
  TextView title=new TextView(this);title.setText("สาริบุตร · อ่านบัตร 1.5.5");title.setTextSize(24);root.addView(title);
  TextView help=new TextView(this);help.setText("เสียบเครื่องอ่าน USB OTG แล้วอ่านบัตร\nเพิ่มสมาชิกบนมือถือ: กดอ่านบัตรจากเว็บ ตรวจข้อมูลที่นี่ แล้วกดยืนยันบันทึกในเว็บ\nส่งเข้าคอมพิวเตอร์: กรอก IP และรหัสจับคู่ แล้วกดส่งข้อมูลผ่าน Wi-Fi");help.setTextSize(16);help.setPadding(0,16,0,16);root.addView(help);
  Button scan=new Button(this);scan.setText("ค้นหาอุปกรณ์ USB ใหม่");scan.setOnClickListener(v->{if(busy)return;cardData=null;results.clear();status.setText("ค้นหาเรียบร้อย");refresh();beginWebRead();});root.addView(scan);
  Button website=new Button(this);website.setText("เปิดเว็บสมาชิกวัดป่านาเทิง");website.setOnClickListener(v->{try{startActivity(new Intent(Intent.ACTION_VIEW,android.net.Uri.parse("https://watt.nathoeng.com")));}catch(Exception e){status.setText("เปิดเบราว์เซอร์แล้วเข้า watt.nathoeng.com");}});root.addView(website);
  desktopIp=new EditText(this);desktopIp.setSingleLine(true);desktopIp.setHint("IP คอมพิวเตอร์ เช่น 192.168.1.20");desktopIp.setInputType(android.text.InputType.TYPE_CLASS_PHONE);root.addView(desktopIp);
  desktopCode=new EditText(this);desktopCode.setSingleLine(true);desktopCode.setHint("รหัสจับคู่ 6 หลักจากคอมพิวเตอร์");desktopCode.setInputType(android.text.InputType.TYPE_CLASS_NUMBER);root.addView(desktopCode);
  status=new TextView(this);status.setTextSize(16);root.addView(status);
  ScrollView scroll=new ScrollView(this);list=new LinearLayout(this);list.setOrientation(1);scroll.addView(list);root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));setContentView(root);
  IntentFilter filter=new IntentFilter(action);filter.addAction(UsbManager.ACTION_USB_DEVICE_ATTACHED);filter.addAction(UsbManager.ACTION_USB_DEVICE_DETACHED);
  if(Build.VERSION.SDK_INT>=33)registerReceiver(receiver,filter,Context.RECEIVER_NOT_EXPORTED);else registerReceiver(receiver,filter);registered=true;
  handleWebIntent(getIntent());
 }
 @Override protected void onResume(){super.onResume();if(manager!=null){refresh();beginWebRead();}}
 @Override protected void onStop(){super.onStop();generation++;if(worker!=null)worker.interrupt();busy=false;cardData=null;if(list!=null)refresh();}
 @Override protected void onDestroy(){generation++;if(worker!=null)worker.interrupt();if(registered)unregisterReceiver(receiver);super.onDestroy();}
 @Override protected void onNewIntent(Intent intent){super.onNewIntent(intent);setIntent(intent);handleWebIntent(intent);beginWebRead();}
 private void handleWebIntent(Intent intent){
  android.net.Uri uri=intent==null?null:intent.getData();
  if(uri==null||!"saributr-card".equals(uri.getScheme())||!"read".equals(uri.getHost()))return;
  String nonce=uri.getQueryParameter("nonce");
  if(nonce==null||!nonce.matches("[a-f0-9]{32}")){status.setText("คำขออ่านบัตรไม่ถูกต้อง กลับไปกดอ่านบัตรที่เว็บใหม่");return;}
  if(busy){status.setText("กำลังอ่านบัตรอยู่ กรุณารอแล้วกดอ่านจากเว็บใหม่");return;}
  webToken=nonce;webRequestedAt=System.currentTimeMillis();webReadRequested=false;webPermissionRequested=false;
  cardData=null;cardReadAt=0;stopService(new Intent(this,CardHandoffService.class));
  status.setText("เพิ่มสมาชิกผ่านมือถือ • อ่านบัตรแล้วตรวจข้อมูลก่อนกดยืนยันบันทึกในเว็บ");
 }
 private void beginWebRead(){
  if(webToken==null||webReadRequested||busy||manager==null)return;
  if(System.currentTimeMillis()-webRequestedAt>300000){webToken=null;status.setText("คำขอหมดอายุ กลับไปกดอ่านบัตรที่เว็บใหม่");return;}
  UsbDevice selected=null;int count=0;
  for(UsbDevice d:manager.getDeviceList().values()){
   boolean ccid=false;for(int j=0;j<d.getInterfaceCount();j++)if(d.getInterface(j).getInterfaceClass()==11)ccid=true;
   if(ccid){selected=d;count++;}
  }
  if(count!=1){status.setText(count==0?"ต่อเครื่องอ่านผ่าน USB OTG แล้วกดค้นหาอุปกรณ์ใหม่":"พบหลายเครื่อง กรุณาเลือกปุ่มอ่านของเครื่องที่ต้องการ");return;}
  if(manager.hasPermission(selected)){webReadRequested=true;readCard(selected);return;}
  if(!webPermissionRequested){webPermissionRequested=true;Intent i=new Intent(action).setPackage(getPackageName());
   PendingIntent pi=PendingIntent.getBroadcast(this,selected.getDeviceId(),i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);manager.requestPermission(selected,pi);}
 }
 private void returnToWeb(){
  if(cardData==null||webToken==null)return;
  if(System.currentTimeMillis()-webRequestedAt>300000){status.setText("คำขอหมดอายุ กลับไปกดอ่านบัตรที่เว็บใหม่");return;}
  try{
   org.json.JSONObject json=cardJson(cardData);
   java.text.SimpleDateFormat iso=new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",java.util.Locale.US);iso.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));json.put("read_at",iso.format(new java.util.Date(cardReadAt)));
   Intent handoff=new Intent(this,CardHandoffService.class);
   handoff.putExtra("nonce",webToken);handoff.putExtra("readAt",cardReadAt);
   handoff.putExtra("card",json.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8));
   startForegroundService(handoff);webToken=null;
  }catch(Exception e){status.setText("ส่งข้อมูลเข้าเว็บไม่ได้ ตรวจว่าใช้ Chrome และกลับไปกดอ่านบัตรที่เว็บใหม่");}
 }
 private void text(String s){TextView t=new TextView(this);t.setText(s);t.setTextSize(16);t.setTextIsSelectable(true);t.setPadding(0,16,0,8);list.addView(t);}
 private void refresh(){list.removeAllViews();
  if(!getPackageManager().hasSystemFeature(PackageManager.FEATURE_USB_HOST)){text("เครื่องนี้ไม่ได้รายงานว่ารองรับ USB Host");return;}
  Map<String,UsbDevice> devices=manager.getDeviceList();
  if(devices.isEmpty()){text("ยังไม่พบอุปกรณ์ USB\nตรวจว่า OTG ยังเปิดอยู่ ลองถอดแล้วเสียบใหม่ และกดค้นหาอีกครั้ง\nไฟที่เครื่องอ่านติดอย่างเดียว ยังไม่ยืนยันว่ามือถือพบอุปกรณ์");return;}
  if(cardData!=null){
   text("อ่านข้อมูลแล้ว • กรุณาตรวจเทียบกับบัตร");
   if(cardData.photo!=null){android.graphics.Bitmap bitmap=android.graphics.BitmapFactory.decodeByteArray(cardData.photo,0,cardData.photo.length);if(bitmap!=null){ImageView photo=new ImageView(this);photo.setImageBitmap(bitmap);photo.setAdjustViewBounds(true);photo.setMaxHeight(400);list.addView(photo,new LinearLayout.LayoutParams(-1,400));}else text("แสดงรูปไม่ได้");}
   text("เลขประจำตัวประชาชน\n"+cardData.citizenId+"\n\nชื่อ–นามสกุล\n"+cardData.name+"\n\nชื่อ–นามสกุลภาษาอังกฤษ\n"+(cardData.nameEn==null||cardData.nameEn.isEmpty()?"ไม่มีข้อมูลจากบัตร":cardData.nameEn)+"\n\nวันเกิด\n"+cardData.birth+"\n\nที่อยู่ตามบัตร\n"+cardData.address);
   if(cardData.photoError!=null)text("อ่านรูปยังไม่สำเร็จ: "+cardData.photoError);
   if(webToken!=null){
    text("ตรวจข้อมูลกับเจ้าของแล้วใช่ไหม? กดยืนยันเพื่อบันทึกบัญชีสมาชิกในเว็บวัด ข้อมูลนี้จะส่งให้เฉพาะเว็บวัดในมือถือเครื่องนี้ภายใน 2 นาที");
    Button saveWeb=new Button(this);saveWeb.setText("ตรวจข้อมูลแล้ว บันทึกสมาชิกในเว็บ");saveWeb.setOnClickListener(v->returnToWeb());list.addView(saveWeb);
   }
   Button send=new Button(this);send.setText("ส่งข้อมูลไปคอมพิวเตอร์ผ่าน Wi-Fi");send.setOnClickListener(v->sendToDesktop());list.addView(send);
   Button export=new Button(this);export.setText("บันทึกไฟล์ JSON (วิธีเดิม)");export.setOnClickListener(v->exportCard());list.addView(export);
   text("ไฟล์นี้มีข้อมูลส่วนตัว เก็บไว้ในเครื่องและลบหลังนำเข้าเสร็จ");
   Button clear=new Button(this);clear.setText("ล้างข้อมูลบนหน้าจอ");clear.setOnClickListener(v->{cardData=null;cardReadAt=0;stopService(new Intent(this,CardHandoffService.class));refresh();});list.addView(clear);
  }
  text("พบอุปกรณ์ USB "+devices.size()+" เครื่อง");
  for(UsbDevice d:devices.values()){
   boolean ccid=false;StringBuilder interfaces=new StringBuilder();
   for(int j=0;j<d.getInterfaceCount();j++){UsbInterface f=d.getInterface(j);if(f.getInterfaceClass()==11)ccid=true;interfaces.append("Interface ").append(j).append(": class ").append(f.getInterfaceClass()).append(", endpoints ").append(f.getEndpointCount()).append("\n");}
   String product=d.getProductName();text((product==null?"อุปกรณ์ USB":product)+"\nVID: "+String.format(Locale.US,"%04X",d.getVendorId())+" / PID: "+String.format(Locale.US,"%04X",d.getProductId())+"\n"+(ccid?"พบอินเทอร์เฟซเครื่องอ่านสมาร์ตการ์ด (CCID)":"ไม่พบอินเทอร์เฟซ CCID มาตรฐาน ต้องตรวจรุ่นเพิ่มเติม")+"\n"+interfaces+"สิทธิ์ USB: "+(manager.hasPermission(d)?"อนุญาตแล้ว":"ยังไม่ได้อนุญาต")+"\n"+results.getOrDefault(d.getDeviceName(),"ยังไม่ได้ทดสอบเปิดการเชื่อมต่อ"));
   Button button=new Button(this);button.setText(manager.hasPermission(d)?"ทดสอบเปิดการเชื่อมต่อ":"อนุญาตและทดสอบเครื่องนี้");button.setOnClickListener(v->{try{
    if(manager.hasPermission(d)){test(d);refresh();}else{Intent i=new Intent(action).setPackage(getPackageName());PendingIntent pi=PendingIntent.getBroadcast(this,d.getDeviceId(),i,PendingIntent.FLAG_UPDATE_CURRENT|PendingIntent.FLAG_IMMUTABLE);manager.requestPermission(d,pi);}
   }catch(Exception e){status.setText("เชื่อมต่อไม่ได้: "+e.getClass().getSimpleName()+" • ลองถอดเสียบใหม่");}});button.setEnabled(!busy);list.addView(button);
   if(ccid&&manager.hasPermission(d)){Button card=new Button(this);card.setText(busy?"กำลังทดสอบ กรุณารอสักครู่":"ทดสอบบัตรที่เสียบอยู่");card.setEnabled(!busy);card.setOnClickListener(v->probe(d));list.addView(card);
    Button read=new Button(this);read.setText(busy?"กำลังอ่าน กรุณารอสักครู่":"อ่านข้อมูลบัตร");read.setEnabled(!busy);read.setOnClickListener(v->readCard(d));list.addView(read);
   }
  }
 }
 private void exportCard(){if(cardData==null)return;try{
  org.json.JSONObject json=cardJson(cardData);
  pendingExport=json.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
  Intent intent=new Intent(Intent.ACTION_CREATE_DOCUMENT);intent.addCategory(Intent.CATEGORY_OPENABLE);intent.setType("application/json");intent.putExtra(Intent.EXTRA_TITLE,"saributr-card-"+System.currentTimeMillis()+".json");startActivityForResult(intent,41);
 }catch(Exception e){pendingExport=null;status.setText("เตรียมไฟล์ไม่สำเร็จ กรุณาอ่านบัตรใหม่");}}
 private static org.json.JSONObject cardJson(ThaiCard.Data data)throws Exception{
  org.json.JSONObject json=new org.json.JSONObject();json.put("format","saributr-card-v1");json.put("citizen_id",data.citizenId);json.put("name_title",data.nameTitle);json.put("first_name",data.firstName);json.put("last_name",data.lastName);json.put("full_name_en",data.nameEn==null?"":data.nameEn);json.put("birth_date",data.birthIso);json.put("kinship_gender",data.gender);json.put("card_address",data.address);json.put("address_house_no",data.addressHouseNo==null?"":data.addressHouseNo);json.put("address_village_no",data.addressVillageNo==null?"":data.addressVillageNo);json.put("address_extra",data.addressExtra==null?"":data.addressExtra);json.put("address_subdistrict",data.addressSubdistrict==null?"":data.addressSubdistrict);json.put("address_district",data.addressDistrict==null?"":data.addressDistrict);json.put("address_province",data.addressProvince==null?"":data.addressProvince);json.put("avatar_image",data.photo==null?"":"data:image/jpeg;base64,"+android.util.Base64.encodeToString(data.photo,android.util.Base64.NO_WRAP));return json;
 }
 private void sendToDesktop(){
  final ThaiCard.Data data=cardData;final long readAt=cardReadAt;
  String ip=desktopIp.getText().toString().trim(),code=desktopCode.getText().toString().trim();
  if(data==null||readAt==0||System.currentTimeMillis()-readAt>120000){status.setText("ข้อมูลบัตรหมดอายุ กรุณาอ่านบัตรใหม่");return;}
  if(!code.matches("[0-9]{6}")||!privateIpv4(ip)){status.setText("กรอก IP ภายในเครือข่ายและรหัสจับคู่ 6 หลักให้ถูกต้อง");return;}
  status.setText("กำลังส่งข้อมูลไปคอมพิวเตอร์…");
  new Thread(()->{String message;java.net.HttpURLConnection conn=null;try{
    org.json.JSONObject body=cardJson(data);java.text.SimpleDateFormat iso=new java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",java.util.Locale.US);iso.setTimeZone(java.util.TimeZone.getTimeZone("UTC"));body.put("read_at",iso.format(new java.util.Date(readAt)));
    byte[] bytes=body.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    if(bytes.length>200000)throw new java.io.IOException("ข้อมูลบัตรใหญ่เกินกำหนด");
    conn=(java.net.HttpURLConnection)new java.net.URL("http://"+ip+":8766/v1/card").openConnection();conn.setRequestMethod("POST");conn.setConnectTimeout(3500);conn.setReadTimeout(3500);conn.setDoOutput(true);conn.setRequestProperty("Content-Type","application/json; charset=utf-8");conn.setRequestProperty("X-Saributr-Code",code);conn.setFixedLengthStreamingMode(bytes.length);
    try(java.io.OutputStream out=conn.getOutputStream()){out.write(bytes);}
    int response=conn.getResponseCode();
    if(response==200)message="ส่งข้อมูลสำเร็จ เปิดหน้าแก้ไขสมาชิกบนคอมพิวเตอร์แล้วกดนำเข้าและบันทึก";
    else if(response==403)message="คอมพิวเตอร์ปฏิเสธ (403) ดูข้อความสีแดงในโปรแกรม Windows; ตรวจรหัสจับคู่และปิดโปรแกรมเก่าที่มุมขวาล่างก่อนเปิดใหม่";
    else if(response==429)message="ป้อนรหัสผิดหลายครั้ง รอ 2 นาทีหรือเปลี่ยนรหัสที่คอมพิวเตอร์";
    else if(response==400)message="ข้อมูลบัตรหมดอายุหรือไม่ครบ กรุณาอ่านบัตรใหม่แล้วส่งภายใน 2 นาที";
    else message="คอมพิวเตอร์ยังไม่รับข้อมูล (รหัส "+response+") ดูข้อความในโปรแกรมบนคอมพิวเตอร์";
  }catch(Exception e){message="ส่งไม่สำเร็จ ตรวจว่าใช้ Wi-Fi วงเดียวกัน โปรแกรมบนคอมพิวเตอร์เปิดอยู่ และไฟร์วอลล์อนุญาตพอร์ต 8766";}finally{if(conn!=null)conn.disconnect();}
   final String result=message;runOnUiThread(()->{if(!isDestroyed())status.setText(result);});
  },"card-to-desktop").start();
 }
 private static boolean privateIpv4(String ip){
  if(!ip.matches("[0-9]{1,3}(\\.[0-9]{1,3}){3}"))return false;
  String[] x=ip.split("\\.");int[] n=new int[4];for(int i=0;i<4;i++){n[i]=Integer.parseInt(x[i]);if(n[i]>255)return false;}
  return n[0]==10||(n[0]==172&&n[1]>=16&&n[1]<=31)||(n[0]==192&&n[1]==168);
 }
 @Override protected void onActivityResult(int request,int result,Intent intent){super.onActivityResult(request,result,intent);if(request!=41)return;
  byte[] bytes=pendingExport;pendingExport=null;
  if(result!=RESULT_OK){status.setText("ยกเลิกการบันทึกไฟล์แล้ว");return;}
  if(bytes==null||intent==null||intent.getData()==null){status.setText("ข้อมูลหมดอายุ กรุณาอ่านบัตรอีกครั้ง");return;}
  try(java.io.OutputStream stream=getContentResolver().openOutputStream(intent.getData())){if(stream==null)throw new java.io.IOException();stream.write(bytes);status.setText("บันทึกไฟล์แล้ว เปิดเว็บ → Admin → นำเข้าจากบัตรประชาชน");}
  catch(Exception e){status.setText("บันทึกไฟล์ไม่สำเร็จ กรุณาอ่านบัตรแล้วลองอีกครั้ง");}
 }
 private void readCard(UsbDevice d){
  if(busy)return;busy=true;cardData=null;cardReadAt=0;stopService(new Intent(this,CardHandoffService.class));final int ticket=++generation;status.setText("กำลังอ่านบัตร…");refresh();
  worker=new Thread(()->{ThaiCard.Data data=null;String error=null;
   try{data=(ThaiCard.Data)UsbCardProbe.run(manager,d,message->runOnUiThread(()->{if(!isDestroyed()&&ticket==generation)status.setText(message);}));}
   catch(Exception e){error="อ่านข้อมูลยังไม่สำเร็จ: "+e.getMessage();}
   final ThaiCard.Data result=data;final String problem=error;
   runOnUiThread(()->{if(isDestroyed()||ticket!=generation)return;busy=false;cardData=result;cardReadAt=result==null?0:System.currentTimeMillis();status.setText(problem==null?"อ่านข้อมูลเสร็จแล้ว":problem);refresh();});
  },"thai-card-read");worker.start();
 }
 private void probe(UsbDevice d){
  if(busy)return;busy=true;final int ticket=++generation;
  results.put(d.getDeviceName(),"กำลังตรวจบัตรและรอชิปตอบสนอง…");refresh();
  worker=new Thread(()->{String answer;try{answer=UsbCardProbe.run(manager,d);}catch(Exception e){answer="ทดสอบยังไม่ผ่าน\n"+e.getMessage();}
   final String result=answer;runOnUiThread(()->{if(isDestroyed()||ticket!=generation)return;busy=false;results.put(d.getDeviceName(),result);status.setText("ทดสอบเสร็จแล้ว");refresh();});
  },"usb-card-probe");worker.start();
 }
 private void test(UsbDevice d){UsbDeviceConnection connection=null;try{
  connection=manager.openDevice(d);results.put(d.getDeviceName(),connection!=null?"✓ เปิดการเชื่อมต่อ USB สำเร็จ\nขั้นต่อไปจึงทดสอบคำสั่งอ่านบัตร":"เปิดการเชื่อมต่อไม่สำเร็จ ลองถอดเสียบใหม่");
 }catch(Exception e){results.put(d.getDeviceName(),"เกิดข้อผิดพลาด: "+e.getClass().getSimpleName());}finally{if(connection!=null)connection.close();}}
}
