using System.Net;
using System.Net.Sockets;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Windows.Forms;

namespace SaributrCardBridge;

internal static class Program
{
    [STAThread]
    static void Main()
    {
        Encoding.RegisterProvider(CodePagesEncodingProvider.Instance);
        ApplicationConfiguration.Initialize();
        Application.Run(new BridgeForm());
    }
}

internal sealed class BridgeForm : Form
{
    private readonly Label info = new() { AutoSize = true, MaximumSize = new System.Drawing.Size(490, 0) };
    private readonly ComboBox readers = new() { Width = 420, DropDownStyle = ComboBoxStyle.DropDownList };
    private readonly NotifyIcon tray = new() { Text = "สาริบุตร อ่านบัตร 1.5", Visible = true, Icon = System.Drawing.SystemIcons.Application };
    private readonly CancellationTokenSource stop = new();
    private readonly object gate = new();
    private CardData? latest;
    private string code = NewCode();
    private int failures;
    private DateTimeOffset blockedUntil;
    private readonly BridgeServer bridge;

    public BridgeForm()
    {
        Text = "สาริบุตร · อ่านบัตร 1.5";
        Width = 560; Height = 380;
        var panel = new FlowLayoutPanel { Dock = DockStyle.Fill, FlowDirection = FlowDirection.TopDown, WrapContents = false, Padding = new Padding(16), AutoScroll = true };
        Controls.Add(panel);
        panel.Controls.Add(new Label { Text = "โปรแกรมอ่านบัตรและเชื่อมหน้าแก้ไขสมาชิก", AutoSize = true, Font = new System.Drawing.Font(Font.FontFamily, 14) });
        panel.Controls.Add(info);
        panel.Controls.Add(readers);
        var scan = new Button { Text = "ค้นหาเครื่องอ่านบนคอมพิวเตอร์", AutoSize = true };
        scan.Click += (_, _) => RefreshReaders(); panel.Controls.Add(scan);
        var read = new Button { Text = "อ่านบัตรที่เสียบคอมพิวเตอร์", AutoSize = true };
        read.Click += async (_, _) => {
            if (readers.SelectedItem is not string device) { MessageBox.Show("เลือกเครื่องอ่านก่อน"); return; }
            read.Enabled = false; SetStatus("กำลังอ่านบัตร…");
            try { var result = await Task.Run(() => CardReader.Read(device, SetStatus)); Store(result); SetStatus("อ่านบัตรสำเร็จ เปิดหน้าแก้ไขสมาชิกแล้วกดนำเข้าและบันทึกภายใน 2 นาที"); }
            catch (Exception ex) { SetStatus(ex.Message); }
            finally { read.Enabled = true; }
        }; panel.Controls.Add(read);
        var reset = new Button { Text = "เปลี่ยนรหัสจับคู่", AutoSize = true };
        reset.Click += (_, _) => { lock (gate) { code = NewCode(); latest = null; failures = 0; blockedUntil = default; } UpdateInfo(); }; panel.Controls.Add(reset);
        var clear = new Button { Text = "ล้างข้อมูลบัตร", AutoSize = true };
        clear.Click += (_, _) => { lock (gate) latest = null; SetStatus("ล้างข้อมูลบัตรแล้ว"); }; panel.Controls.Add(clear);
        tray.DoubleClick += (_, _) => { Show(); WindowState = FormWindowState.Normal; Activate(); };
        tray.ContextMenuStrip = new ContextMenuStrip();
        tray.ContextMenuStrip.Items.Add("เปิดหน้าต่าง", null, (_, _) => { Show(); WindowState = FormWindowState.Normal; Activate(); });
        tray.ContextMenuStrip.Items.Add("ออก", null, (_, _) => { reallyClose = true; Close(); });
        FormClosing += (_, e) => { if (!reallyClose) { e.Cancel = true; Hide(); } };
        FormClosed += (_, _) => { stop.Cancel(); tray.Dispose(); };
        bridge = new BridgeServer(this);
        _ = bridge.RunAsync(IPAddress.Loopback, 8765, stop.Token);
        _ = bridge.RunAsync(IPAddress.Any, 8766, stop.Token);
        UpdateInfo(); RefreshReaders();
    }
    private bool reallyClose;
    private static string NewCode() => RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");
    private void UpdateInfo()
    {
        string ips = string.Join(", ", Dns.GetHostAddresses(Dns.GetHostName())
            .Where(x => x.AddressFamily == AddressFamily.InterNetwork && IsPrivate(x)).Select(x => x.ToString()));
        info.Text = $"คอมพิวเตอร์ IP: {ips}\nรหัสจับคู่มือถือ: {code}\nมือถือและคอมพิวเตอร์ต้องใช้ Wi-Fi วงเดียวกัน\nโปรแกรมทำงานอยู่ที่มุมขวาล่างเมื่อปิดหน้าต่าง";
    }
    private void RefreshReaders()
    {
        try { readers.Items.Clear(); readers.Items.AddRange(CardReader.Readers()); if (readers.Items.Count > 0) readers.SelectedIndex = 0; else SetStatus("ไม่พบเครื่องอ่านบัตรที่เสียบคอมพิวเตอร์"); }
        catch (Exception ex) { SetStatus(ex.Message); }
    }
    private void SetStatus(string message)
    {
        if (IsDisposed) return;
        if (InvokeRequired) { BeginInvoke(() => SetStatus(message)); return; }
        Text = "สาริบุตร 1.5 · " + message;
    }
    private static bool IsPrivate(IPAddress addr)
    {
        if (addr.AddressFamily != AddressFamily.InterNetwork) return false;
        var b = addr.GetAddressBytes();
        return b[0] == 10 || (b[0] == 172 && b[1] is >= 16 and <= 31) || (b[0] == 192 && b[1] == 168);
    }
    private void Store(CardData data) { lock (gate) latest = data; }
    internal (int, string?) Read(string? origin)
    {
        if (origin != "https://watt.nathoeng.com") return (403, null);
        lock (gate)
        {
            if (latest == null || !DateTimeOffset.TryParse(latest.read_at, out var at) ||
                (DateTimeOffset.UtcNow - at).TotalSeconds > 120 || at > DateTimeOffset.UtcNow.AddSeconds(10))
            { latest = null; return (404, null); }
            return (200, JsonSerializer.Serialize(latest));
        }
    }
    internal int Receive(IPAddress remote, string? pairingCode, string body)
    {
        if (!IsPrivate(remote)) return 403;
        lock (gate)
        {
            if (DateTimeOffset.UtcNow < blockedUntil) return 429;
            if (!string.Equals(pairingCode, code, StringComparison.Ordinal))
            {
                if (++failures >= 5) { blockedUntil = DateTimeOffset.UtcNow.AddMinutes(2); failures = 0; }
                return 403;
            }
            failures = 0;
        }
        try
        {
            var card = JsonSerializer.Deserialize<CardData>(body);
            if (card == null || card.format != "saributr-card-v1" || card.citizen_id.Length != 13 ||
                !card.citizen_id.All(char.IsAsciiDigit) || card.first_name.Length == 0 ||
                card.avatar_image.Length > 100000 || !DateTimeOffset.TryParse(card.read_at, out var at) ||
                Math.Abs((DateTimeOffset.UtcNow - at).TotalSeconds) > 120) return 400;
            Store(card);
            SetStatus("รับข้อมูลจากมือถือแล้ว เปิดหน้าแก้ไขสมาชิกบนคอมพิวเตอร์ภายใน 2 นาที");
            return 200;
        }
        catch (Exception) { return 400; }
    }
    internal void Report(string text) => SetStatus(text);
}

internal sealed class BridgeServer(BridgeForm form)
{
    private const int MaxBody = 200000;
    private const string AllowedOrigin = "https://watt.nathoeng.com";
    public async Task RunAsync(IPAddress address, int port, CancellationToken cancel)
    {
        var listener = new TcpListener(address, port);
        try
        {
            listener.Start(8);
            while (!cancel.IsCancellationRequested)
            {
                var client = await listener.AcceptTcpClientAsync(cancel);
                _ = Task.Run(() => HandleAsync(client, port), cancel);
            }
        }
        catch (OperationCanceledException) { }
        catch (Exception ex) { form.Report($"เปิดพอร์ต {port} ไม่ได้: {ex.Message}"); }
        finally { listener.Stop(); }
    }
    private async Task HandleAsync(TcpClient client, int port)
    {
        using (client)
        {
            try
            {
                client.ReceiveTimeout = 4000; client.SendTimeout = 4000;
                using var stream = client.GetStream();
                using var timeout = new CancellationTokenSource(TimeSpan.FromSeconds(4));
                var headers = new List<byte>(); var octet = new byte[1];
                while (headers.Count < 8192)
                {
                    if (await stream.ReadAsync(octet, timeout.Token) != 1) return;
                    headers.Add(octet[0]);
                    if (headers.Count >= 4 && headers[^4] == 13 && headers[^3] == 10 && headers[^2] == 13 && headers[^1] == 10) break;
                }
                if (headers.Count >= 8192) { await Reply(stream, 400); return; }
                string[] lines = Encoding.ASCII.GetString(headers.ToArray()).Split("\r\n");
                var request = lines[0].Split(' ');
                if (request.Length < 3 || request[2] != "HTTP/1.1") { await Reply(stream, 400); return; }
                var fields = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
                foreach (var line in lines.Skip(1))
                {
                    int colon = line.IndexOf(':'); if (colon > 0) fields[line[..colon].Trim()] = line[(colon + 1)..].Trim();
                }
                fields.TryGetValue("Origin", out var origin);
                if (port == 8765)
                {
                    if (origin != AllowedOrigin) { await Reply(stream, 403); return; }
                    var cors = "Access-Control-Allow-Origin: " + AllowedOrigin + "\r\nVary: Origin\r\nAccess-Control-Allow-Methods: GET, OPTIONS\r\nAccess-Control-Allow-Headers: Content-Type\r\nAccess-Control-Allow-Private-Network: true\r\n";
                    if (request[0] == "OPTIONS" && request[1] == "/v1/card/latest") { await Reply(stream, 204, null, cors); return; }
                    if (request[0] != "GET" || request[1] != "/v1/card/latest") { await Reply(stream, 404, null, cors); return; }
                    var (status, body) = form.Read(origin); await Reply(stream, status, body, cors); return;
                }
                if (request[0] != "POST" || request[1] != "/v1/card" || fields.ContainsKey("Transfer-Encoding") ||
                    !fields.TryGetValue("Content-Length", out var lengthText) || !int.TryParse(lengthText, out int length) || length <= 0 || length > MaxBody)
                { await Reply(stream, 400); return; }
                if (!fields.TryGetValue("Content-Type", out var type) || !type.StartsWith("application/json", StringComparison.OrdinalIgnoreCase))
                { await Reply(stream, 415); return; }
                var bodyBytes = new byte[length]; await stream.ReadExactlyAsync(bodyBytes, timeout.Token);
                fields.TryGetValue("X-Saributr-Code", out var code);
                int outcome = form.Receive(((IPEndPoint)client.Client.RemoteEndPoint!).Address, code, Encoding.UTF8.GetString(bodyBytes));
                await Reply(stream, outcome);
            }
            catch (Exception) { /* Incomplete or disconnected request. */ }
        }
    }
    private static async Task Reply(NetworkStream stream, int status, string? body = null, string cors = "")
    {
        byte[] content = Encoding.UTF8.GetBytes(body ?? "");
        string reason = status switch { 200 => "OK", 204 => "No Content", 400 => "Bad Request", 403 => "Forbidden", 404 => "Not Found", 415 => "Unsupported Media Type", 429 => "Too Many Requests", _ => "Error" };
        var head = Encoding.ASCII.GetBytes($"HTTP/1.1 {status} {reason}\r\nContent-Type: application/json; charset=utf-8\r\nCache-Control: no-store\r\n{cors}Content-Length: {content.Length}\r\nConnection: close\r\n\r\n");
        await stream.WriteAsync(head); if (content.Length > 0) await stream.WriteAsync(content);
    }
}
