import com.saributr.usbprobe.WebCardBridge;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicInteger;

public class WebCardBridgeTest {
  static final String TOKEN="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",ORIGIN="https://watt.nathoeng.com";
  static String request(String method,String origin,String token,String extra)throws Exception {
    try(Socket socket=new Socket("127.0.0.1",8765)) {
      socket.setSoTimeout(4000);
      String req=method+" /v1/card/latest?token="+token+" HTTP/1.1\r\nHost: 127.0.0.1:8765\r\nOrigin: "+origin+"\r\n"+extra+"\r\n";
      socket.getOutputStream().write(req.getBytes(StandardCharsets.US_ASCII));
      ByteArrayOutputStream out=new ByteArrayOutputStream();byte[] buf=new byte[2048];int n;
      while((n=socket.getInputStream().read(buf))!=-1)out.write(buf,0,n);
      return new String(out.toByteArray(),StandardCharsets.UTF_8);
    }
  }
  static void check(boolean condition,String name){if(!condition)throw new AssertionError(name);}
  public static void main(String[] args)throws Exception {
    byte[] payload="{\"synthetic\":true}".getBytes(StandardCharsets.UTF_8);
    AtomicInteger consumed=new AtomicInteger();
    try(WebCardBridge bridge=new WebCardBridge(consumed::incrementAndGet)) {
      bridge.offer(TOKEN,payload,System.currentTimeMillis());
      check(request("GET","https://other.example",TOKEN,"").startsWith("HTTP/1.1 403"),"reject other origin");
      String preflight=request("OPTIONS",ORIGIN,TOKEN,"Access-Control-Request-Method: GET\r\nAccess-Control-Request-Private-Network: true\r\n");
      check(preflight.startsWith("HTTP/1.1 204")&&preflight.contains("Access-Control-Allow-Private-Network: true"),"preflight");
      check(!preflight.contains("synthetic"),"preflight contains no card");
      check(request("GET",ORIGIN,"bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb","").startsWith("HTTP/1.1 404"),"wrong token");
      check(request("POST",ORIGIN,TOKEN,"").startsWith("HTTP/1.1 405"),"method");
      check(consumed.get()==0,"denied requests must not stop the service");
      String response=request("GET",ORIGIN,TOKEN,"");
      check(response.startsWith("HTTP/1.1 200")&&response.endsWith("{\"synthetic\":true}"),"valid read");
      check(response.contains("Cache-Control: no-store"),"no cache");
      check(request("GET",ORIGIN,TOKEN,"").startsWith("HTTP/1.1 404"),"one time consumption");
      check(consumed.get()==1,"completed read stops the service exactly once");
      boolean expired=false;try{bridge.offer(TOKEN,payload,System.currentTimeMillis()-121000);}catch(IOException e){expired=true;}
      check(expired,"old card rejected");
      bridge.offer(TOKEN,payload,System.currentTimeMillis());bridge.clear();
      check(request("GET",ORIGIN,TOKEN,"").startsWith("HTTP/1.1 404"),"explicit clear");
      check(consumed.get()==1,"clear does not report a successful handoff");
    }
    System.out.println("Bridge passed: origin, nonce, preflight, method, one-time read, no cache, expiry and clear.");
  }
}
