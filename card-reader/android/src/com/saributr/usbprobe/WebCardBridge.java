package com.saributr.usbprobe;

import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.util.*;

// Card details never leave this phone until the owner is reviewed and the
// authenticated temple browser reads this one-time, short-lived handoff.
public final class WebCardBridge implements Closeable {
  private static final String ORIGIN = "https://watt.nathoeng.com";
  private final ServerSocket server;
  private final Thread listener;
  private final Timer expiry = new Timer(true);
  private final Runnable onConsumed;
  private byte[] card;
  private String token;
  private long readAt;
  private TimerTask clearTask;

  public WebCardBridge() throws IOException { this(null); }
  public WebCardBridge(Runnable onConsumed) throws IOException {
    this.onConsumed = onConsumed;
    server = new ServerSocket();
    server.bind(new InetSocketAddress(InetAddress.getByName("127.0.0.1"), 8765), 4);
    listener = new Thread(() -> {
      while (!server.isClosed()) {
        try (Socket socket = server.accept()) { handle(socket); }
        catch (IOException ignored) { /* Closing a socket exposes no card data. */ }
      }
    }, "temple-card-handoff");
    listener.setDaemon(true); listener.start();
  }

  public synchronized void offer(String nonce, byte[] payload, long timestamp) throws IOException {
    clear();
    long age = System.currentTimeMillis() - timestamp;
    if (nonce == null || !nonce.matches("[a-f0-9]{32}") || payload == null || payload.length > 200000 ||
        age < -10000 || age > 120000) throw new IOException("ข้อมูลบัตรหมดอายุ กรุณาอ่านบัตรใหม่");
    token = nonce; card = payload.clone(); readAt = timestamp;
    clearTask = new TimerTask() { public void run() { clear(); } };
    expiry.schedule(clearTask, Math.max(1, 120000 - age));
  }

  public synchronized void clear() {
    if (clearTask != null) { clearTask.cancel(); clearTask = null; }
    if (card != null) Arrays.fill(card, (byte) 0);
    card = null; token = null; readAt = 0;
  }

  private void handle(Socket socket) throws IOException {
    socket.setSoTimeout(3000);
    BufferedReader in = new BufferedReader(new InputStreamReader(socket.getInputStream(), StandardCharsets.US_ASCII));
    String request = readLine(in); if (request == null) return;
    String[] parts = request.split(" "); if (parts.length != 3) { reply(socket, 400, null, false); return; }
    Map<String,String> headers = new HashMap<>(); int size = request.length();
    while (true) {
      String line = readLine(in); if (line == null) return; size += line.length();
      if (size > 8192) { reply(socket, 400, null, false); return; }
      if (line.isEmpty()) break;
      int colon = line.indexOf(':'); if (colon < 1) { reply(socket, 400, null, false); return; }
      String key = line.substring(0, colon).toLowerCase(Locale.US);
      if (headers.containsKey(key)) { reply(socket, 400, null, false); return; }
      headers.put(key, line.substring(colon + 1).trim());
    }
    boolean allowed = ORIGIN.equals(headers.get("origin")) && "127.0.0.1:8765".equals(headers.get("host"));
    if (!allowed) { reply(socket, 403, null, false); return; }
    if (!parts[1].matches("/v1/card/latest\\?token=[a-f0-9]{32}")) { reply(socket, 404, null, true); return; }
    if (parts[0].equals("OPTIONS")) {
      reply(socket, "GET".equals(headers.get("access-control-request-method")) ? 204 : 405, null, true); return;
    }
    if (!parts[0].equals("GET")) { reply(socket, 405, null, true); return; }
    synchronized (this) {
      long age = System.currentTimeMillis() - readAt;
      if (card == null || age > 120000 || age < -10000 || !parts[1].endsWith("token=" + token)) {
        if (age > 120000) clear(); reply(socket, 404, null, true); return;
      }
      // Keep the handoff if the socket write fails; successful reads consume it.
      reply(socket, 200, card, true); clear();
      if (onConsumed != null) onConsumed.run();
    }
  }

  private static String readLine(BufferedReader in) throws IOException {
    StringBuilder line = new StringBuilder(); int c;
    while ((c = in.read()) != -1) {
      if (c == '\n') return line.toString().replaceFirst("\\r$", "");
      if (line.length() >= 4096) throw new IOException("Header too long");
      line.append((char)c);
    }
    return null;
  }
  private static void reply(Socket socket, int status, byte[] body, boolean cors) throws IOException {
    String reason = status == 200 ? "OK" : status == 204 ? "No Content" : status == 403 ? "Forbidden" :
      status == 404 ? "Not Found" : status == 405 ? "Method Not Allowed" : "Bad Request";
    String head = "HTTP/1.1 " + status + " " + reason + "\r\nContent-Type: application/json; charset=utf-8\r\n" +
      "Cache-Control: no-store\r\nX-Content-Type-Options: nosniff\r\nConnection: close\r\n" +
      (cors ? "Access-Control-Allow-Origin: " + ORIGIN + "\r\nVary: Origin\r\nAccess-Control-Allow-Methods: GET, OPTIONS\r\nAccess-Control-Allow-Private-Network: true\r\n" : "") +
      "Content-Length: " + (body == null ? 0 : body.length) + "\r\n\r\n";
    OutputStream out = socket.getOutputStream(); out.write(head.getBytes(StandardCharsets.US_ASCII));
    if (body != null) out.write(body); out.flush();
  }
  @Override public void close() throws IOException { clear(); expiry.cancel(); server.close(); listener.interrupt(); }
}
