package com.saributr.usbprobe;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.util.*;
import javax.crypto.*;
import javax.crypto.spec.*;

public final class CardReturnCipherTest {
  private static final String NONCE="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",KEY="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
  private static void check(boolean value,String name){if(!value)throw new AssertionError(name);}
  private static byte[] decrypt(String packet,String nonce,byte[] key)throws Exception{
    String[] parts=packet.split("\\.");Base64.Decoder decoder=Base64.getUrlDecoder();
    Cipher cipher=Cipher.getInstance("AES/GCM/NoPadding");
    cipher.init(Cipher.DECRYPT_MODE,new SecretKeySpec(key,"AES"),new GCMParameterSpec(128,decoder.decode(parts[1])));
    cipher.updateAAD((CardReturnCipher.ORIGIN+"|nathoeng-card-v1|"+nonce).getBytes(StandardCharsets.UTF_8));
    return cipher.doFinal(decoder.decode(parts[2]));
  }
  public static void main(String[] args)throws Exception{
    byte[] key=CardReturnCipher.keyFromHex(KEY);
    if(args.length==2&&args[0].equals("--fixture")){
      System.out.print(CardReturnCipher.encrypt(NONCE,key,Files.readAllBytes(Paths.get(args[1])),System.currentTimeMillis()));return;
    }
    byte[] payload="{\"synthetic\":\"ทดสอบ\"}".getBytes(StandardCharsets.UTF_8);
    String packet=CardReturnCipher.encrypt(NONCE,key,payload,System.currentTimeMillis());
    check(Arrays.equals(payload,decrypt(packet,NONCE,key)),"UTF-8 roundtrip");
    check(packet.matches("v1\\.[A-Za-z0-9_-]{16}\\.[A-Za-z0-9_-]+"),"URL-safe packet");
    check(!packet.equals(CardReturnCipher.encrypt(NONCE,key,payload,System.currentTimeMillis())),"fresh IV");
    boolean rejected=false;try{decrypt(packet,"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",key);}catch(AEADBadTagException e){rejected=true;}
    check(rejected,"nonce binding");
    byte[] other=key.clone();other[0]^=1;rejected=false;try{decrypt(packet,NONCE,other);}catch(AEADBadTagException e){rejected=true;}
    check(rejected,"wrong key");
    String[] parts=packet.split("\\.");byte[] corrupted=Base64.getUrlDecoder().decode(parts[2]);corrupted[0]^=1;
    rejected=false;try{decrypt(parts[0]+"."+parts[1]+"."+Base64.getUrlEncoder().withoutPadding().encodeToString(corrupted),NONCE,key);}catch(AEADBadTagException e){rejected=true;}
    check(rejected,"tamper rejection");
    rejected=false;try{CardReturnCipher.encrypt(NONCE,key,payload,System.currentTimeMillis()-121000);}catch(java.io.IOException e){rejected=true;}
    check(rejected,"original read expiry");
    rejected=false;try{CardReturnCipher.encrypt(NONCE,key,new byte[32001],System.currentTimeMillis());}catch(java.io.IOException e){rejected=true;}
    check(rejected,"size bound");
    check(CardReturnCipher.encrypt(NONCE,key,new byte[32000],System.currentTimeMillis()).length()<45000,"maximum callback size");
    System.out.println("PASS: UTF-8, URL-safe AES-GCM, fresh IV, nonce/key binding, tamper, expiry and size bounds");
  }
}
