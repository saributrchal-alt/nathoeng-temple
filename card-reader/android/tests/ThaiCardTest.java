package com.saributr.usbprobe;
import java.util.*;
import java.io.*;
import java.nio.charset.Charset;
public class ThaiCardTest {
 static void check(boolean b){if(!b)throw new AssertionError();}
 static class Fake implements Ccid.Transport {
  byte[] request,pending;boolean off;int photoReads;boolean failPhoto;boolean badId;
  public void write(byte[] b){request=b;}
  byte[] field(String s,int length,String encoding){byte[] b=new byte[length];Arrays.fill(b,(byte)32);byte[] text=s.getBytes(Charset.forName(encoding));System.arraycopy(text,0,b,0,text.length);return b;}
  public byte[] read()throws IOException{
   int type=request[0]&255;byte[] payload=new byte[0];int answer=0x81;
   if(type==0x62){answer=0x80;payload=new byte[]{0x3B,0x79};}
   if(type==0x63)off=true;
   if(type==0x6F){answer=0x80;int ins=request[11]&255;
    if(ins==0xA4)payload=new byte[]{(byte)0x90,0};
    else if(ins==0xB0){int at=((request[12]&255)<<8)|(request[13]&255);int n=request[16]&255;
     if(at==0x04)pending=field(badId?"NOT-A-NUMBER!":"0000000000000",13,"US-ASCII");
     else if(at==0x11)pending=field("นาย#สมชาย##ใจดี",100,"TIS-620");
     else if(at==0x75)pending=field("Mr.#Somchai##Jaidee",100,"US-ASCII");
     else if(at==0xE1)pending=field("1",1,"US-ASCII");
     else if(at==0xD9)pending=field("25251118",8,"US-ASCII");
     else if(at==0x1579)pending=field("8#2####ธาตุ#วานรนิวาส#สกลนคร",100,"TIS-620");
     else if(at>=0x17B&&at<0x1579){photoReads++;if(failPhoto)throw new IOException("photo timeout");pending=new byte[n];if(at==0x17B){pending[0]=(byte)255;pending[1]=(byte)216;pending[2]=(byte)255;pending[3]=(byte)217;}}
     else throw new AssertionError("Unexpected read offset: "+at);
     payload=new byte[]{0x61,(byte)n};
    }else if(ins==0xC0){payload=Arrays.copyOf(pending,pending.length+2);payload[payload.length-2]=(byte)0x90;}
    else throw new AssertionError();
   }
   byte[] frame=new byte[10+payload.length];frame[0]=(byte)answer;frame[1]=(byte)payload.length;frame[2]=(byte)(payload.length>>8);frame[6]=request[6];System.arraycopy(payload,0,frame,10,payload.length);return frame;
  }
 }
 public static void main(String[] a)throws Exception{
  Fake f=new Fake();ThaiCard.Data d=new ThaiCard(new Ccid(f)).readAll(s->{});
  check(d.birthIso.equals("1982-11-18"));check(d.firstName.equals("สมชาย"));check(d.nameEn.equals("Mr. Somchai Jaidee"));check(d.gender.equals("male"));check(d.citizenId.equals("0000000000000"));check(d.name.equals("นาย สมชาย ใจดี"));check(d.birth.equals("18/11/2525 (พ.ศ.)"));check(d.address.contains("สกลนคร"));check(d.addressHouseNo.equals("8"));check(d.addressVillageNo.equals("2"));check(d.addressSubdistrict.equals("ธาตุ"));check(d.addressDistrict.equals("วานรนิวาส"));check(d.addressProvince.equals("สกลนคร"));check(d.photo.length==4);check(f.photoReads==20&&f.off);
  Fake bad=new Fake();bad.badId=true;try{new ThaiCard(new Ccid(bad)).readAll(x->{});throw new AssertionError();}catch(IOException expected){check(bad.off);}
  Fake fail=new Fake();fail.failPhoto=true;ThaiCard.Data partial=new ThaiCard(new Ccid(fail)).readAll(s->{});check(partial.name!=null&&partial.photo==null&&partial.photoError!=null&&fail.off);
  check(ThaiCard.birth("25250000".getBytes()).contains("ไม่ระบุเดือน"));check(ThaiCard.birth("25251100".getBytes()).contains("ไม่ระบุวัน"));
  try{ThaiCard.birth("25250231".getBytes());throw new AssertionError();}catch(IOException ok){}
  System.out.println("PASS: Thai text, BE date, unknown/invalid date, chained GET RESPONSE, 20 photo chunks, partial photo error, cleanup, allowed offsets only");
 }
}
