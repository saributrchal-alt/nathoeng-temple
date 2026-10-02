import com.saributr.usbprobe.Ccid;
import java.io.*;
import java.util.*;
public class CcidTest {
 static byte[] reply(int type,int seq,int status,byte...payload){byte[] b=new byte[10+payload.length];b[0]=(byte)type;b[1]=(byte)payload.length;b[6]=(byte)seq;b[7]=(byte)status;System.arraycopy(payload,0,b,10,payload.length);return b;}
 static class Fake implements Ccid.Transport {
  Queue<byte[]> q=new LinkedList<>();List<Integer> writes=new ArrayList<>();
  Fake(byte[]...responses){q.addAll(Arrays.asList(responses));}
  public void write(byte[] b){writes.add(b[0]&255);if(b.length!=10||b[5]!=0)throw new AssertionError();}
  public byte[] read()throws IOException{if(q.isEmpty())throw new IOException("timeout");return q.remove();}
 }
 static void check(boolean b){if(!b)throw new AssertionError();}
 static void fails(Fake f)throws Exception{try{new Ccid(f).probe();throw new AssertionError("must fail");}catch(IOException expected){}}
 public static void main(String[] args)throws Exception {
  Fake none=new Fake(reply(0x81,0,2));check(new Ccid(none).probe().contains("ยังไม่พบบัตร"));check(none.writes.equals(Arrays.asList(0x65)));
  Fake good=new Fake(reply(0x81,0,1),reply(0x80,1,0,(byte)0x3B,(byte)0x00),reply(0x81,2,1));check(new Ccid(good).probe().contains("ชิปตอบสนอง"));check(good.writes.equals(Arrays.asList(0x65,0x62,0x63)));
  fails(new Fake(reply(0x81,4,0)));fails(new Fake(new byte[5]));fails(new Fake(reply(0x81,0,0x40)));
  byte[] malformed=reply(0x81,0,0);malformed[1]=20;fails(new Fake(malformed));
  Fake invalid=new Fake(reply(0x81,0,1),reply(0x80,1,0,(byte)1,(byte)2),reply(0x81,2,1));fails(invalid);check(invalid.writes.contains(0x63));
  Fake extension=new Fake(reply(0x81,0,0x80),reply(0x81,0,2));check(new Ccid(extension).probe().contains("ยังไม่พบบัตร"));
  Fake endless=new Fake();for(int i=0;i<8;i++)endless.q.add(reply(0x81,0,0x80));fails(endless);check(endless.q.isEmpty());
  fails(new Fake());System.out.println("PASS: absent card, ATR success, power-off cleanup, wrong sequence, short/invalid frames, errors, time extension, bounded retries, timeout");
 }
}
