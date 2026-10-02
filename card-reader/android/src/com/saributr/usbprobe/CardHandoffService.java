package com.saributr.usbprobe;

import android.app.*;
import android.content.*;
import android.content.pm.ServiceInfo;
import android.hardware.usb.UsbManager;
import android.net.Uri;
import android.os.*;
import android.widget.Toast;
import java.util.Arrays;

/** Keeps only the reviewed, one-time handoff alive while Chrome is in front. */
public final class CardHandoffService extends Service {
  private static final String CHANNEL = "card_handoff", STOP = "com.saributr.usbprobe.STOP_HANDOFF";
  private static final int NOTIFICATION_ID = 154;
  private final Handler main = new Handler(Looper.getMainLooper());
  private final Runnable finish = () -> stopSelf();
  private WebCardBridge bridge;
  private boolean receiverRegistered;
  private final BroadcastReceiver detached = new BroadcastReceiver() {
    public void onReceive(Context context, Intent intent) { stopSelf(); }
  };

  @Override public void onCreate() {
    super.onCreate();
    NotificationManager notifications = (NotificationManager) getSystemService(NOTIFICATION_SERVICE);
    notifications.createNotificationChannel(new NotificationChannel(CHANNEL, "ส่งข้อมูลบัตรเข้าเว็บ", NotificationManager.IMPORTANCE_LOW));
    Intent cancel = new Intent(this, CardHandoffService.class).setAction(STOP);
    PendingIntent stop = PendingIntent.getService(this, 0, cancel, PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    PendingIntent open = PendingIntent.getActivity(this, 0, new Intent(this, MainActivity.class), PendingIntent.FLAG_UPDATE_CURRENT | PendingIntent.FLAG_IMMUTABLE);
    Notification notification = new Notification.Builder(this, CHANNEL)
      .setSmallIcon(android.R.drawable.ic_menu_upload)
      .setContentTitle("รอส่งข้อมูลบัตรเข้าเว็บวัด")
      .setContentText("กลับเข้า Chrome เพื่อบันทึก • ล้างข้อมูลอัตโนมัติภายใน 2 นาที")
      .setContentIntent(open).setOngoing(true).setOnlyAlertOnce(true)
      .addAction(new Notification.Action.Builder(android.graphics.drawable.Icon.createWithResource(this, android.R.drawable.ic_menu_close_clear_cancel), "ยกเลิกและล้างข้อมูล", stop).build())
      .build();
    if (Build.VERSION.SDK_INT >= 34) startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_SHORT_SERVICE);
    else startForeground(NOTIFICATION_ID, notification);
    IntentFilter filter = new IntentFilter(UsbManager.ACTION_USB_DEVICE_DETACHED);
    if (Build.VERSION.SDK_INT >= 33) registerReceiver(detached, filter, Context.RECEIVER_NOT_EXPORTED);
    else registerReceiver(detached, filter);
    receiverRegistered = true;
  }

  @Override public int onStartCommand(Intent intent, int flags, int startId) {
    if (intent == null || STOP.equals(intent.getAction())) { stopSelf(); return START_NOT_STICKY; }
    byte[] payload = intent.getByteArrayExtra("card");
    String nonce = intent.getStringExtra("nonce");
    long readAt = intent.getLongExtra("readAt", 0);
    intent.removeExtra("card"); intent.removeExtra("nonce"); intent.removeExtra("readAt");
    try {
      main.removeCallbacks(finish);
      if (bridge != null) bridge.close();
      bridge = new WebCardBridge(() -> main.post(finish));
      bridge.offer(nonce, payload, readAt);
      main.postDelayed(finish, Math.max(1, 120000 - (System.currentTimeMillis() - readAt)));
      // Bind and offer BEFORE switching apps. The service owns the socket, so
      // Activity.onStop/onDestroy cannot close it while Chrome requests the card.
      Intent browser = new Intent(Intent.ACTION_VIEW, Uri.parse("https://watt.nathoeng.com/?reader_nonce=" + nonce + "#admin-dashboard"));
      browser.addCategory(Intent.CATEGORY_BROWSABLE); browser.setPackage("com.android.chrome");
      browser.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK); startActivity(browser);
    } catch (Exception ignored) {
      Toast.makeText(this, "ส่งข้อมูลเข้าเว็บไม่ได้ ตรวจว่าใช้ Chrome แล้วกดอ่านบัตรจากเว็บใหม่", Toast.LENGTH_LONG).show();
      stopSelf();
    } finally { if (payload != null) Arrays.fill(payload, (byte) 0); }
    return START_NOT_STICKY;
  }

  @Override public IBinder onBind(Intent intent) { return null; }
  @Override public void onTimeout(int startId) { stopSelf(); }
  @Override public void onTimeout(int startId, int fgsType) { stopSelf(); }
  @Override public void onDestroy() {
    main.removeCallbacks(finish);
    if (receiverRegistered) unregisterReceiver(detached);
    try { if (bridge != null) bridge.close(); } catch (Exception ignored) { }
    bridge = null; stopForeground(STOP_FOREGROUND_REMOVE); super.onDestroy();
  }
}
