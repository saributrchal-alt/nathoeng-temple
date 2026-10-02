package com.saributr.usbprobe;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;

/** Authenticated, browser-bound data passed only in an HTTPS URL fragment. */
public final class CardReturnCipher {
  public static final String ORIGIN = "https://watt.nathoeng.com";
  public static byte[] keyFromHex(String value) {
    if (value == null || !value.matches("[a-f0-9]{64}")) throw new IllegalArgumentException("Invalid one-request key");
    byte[] key = new byte[32];
    for (int i = 0; i < key.length; i++) key[i] = (byte) Integer.parseInt(value.substring(i * 2, i * 2 + 2), 16);
    return key;
  }
  public static String encrypt(String nonce, byte[] key, byte[] payload, long readAt) throws Exception {
    long age = System.currentTimeMillis() - readAt;
    if (nonce == null || !nonce.matches("[a-f0-9]{32}") || key == null || key.length != 32)
      throw new IOException("คำขอไม่ถูกต้อง กลับไปกดอ่านบัตรจากเว็บใหม่");
    // Thai ID photos are at most 5100 bytes. Keep the callback far below Android
    // Binder and Chrome URL limits, including UTF-16 Intent serialization.
    if (payload == null || payload.length > 32000) throw new IOException("ข้อมูลบัตรใหญ่เกินกำหนด ใช้ส่งออก JSON แทน");
    if (age < -10000 || age > 120000) throw new IOException("ข้อมูลบัตรหมดอายุ กรุณาอ่านบัตรใหม่");
    byte[] iv = new byte[12]; new SecureRandom().nextBytes(iv);
    Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, iv));
    cipher.updateAAD((ORIGIN + "|nathoeng-card-v1|" + nonce).getBytes(StandardCharsets.UTF_8));
    Base64.Encoder encoder = Base64.getUrlEncoder().withoutPadding();
    return "v1." + encoder.encodeToString(iv) + "." + encoder.encodeToString(cipher.doFinal(payload));
  }
  private CardReturnCipher() { }
}
