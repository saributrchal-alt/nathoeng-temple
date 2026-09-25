using System.Runtime.InteropServices;
using System.Text;
using System.Text.Json;

namespace SaributrCardBridge;

internal sealed class CardData
{
    public string format { get; set; } = "saributr-card-v1";
    public string read_at { get; set; } = DateTimeOffset.UtcNow.ToString("O");
    public string citizen_id { get; set; } = "";
    public string name_title { get; set; } = "";
    public string first_name { get; set; } = "";
    public string last_name { get; set; } = "";
    public string full_name_en { get; set; } = "";
    public string birth_date { get; set; } = "";
    public string kinship_gender { get; set; } = "";
    public string card_address { get; set; } = "";
    public string avatar_image { get; set; } = "";
}

internal static class CardReader
{
    private const uint Shared = 2, T0 = 1, T1 = 2, Leave = 0;
    private const int Success = 0;
    [DllImport("winscard.dll", CharSet = CharSet.Unicode)] private static extern int SCardEstablishContext(uint scope, IntPtr reserved1, IntPtr reserved2, out IntPtr context);
    [DllImport("winscard.dll")] private static extern int SCardReleaseContext(IntPtr context);
    [DllImport("winscard.dll", CharSet = CharSet.Unicode, EntryPoint = "SCardListReadersW")]
    private static extern int SCardListReaders(IntPtr context, string? groups, char[]? readers, ref uint length);
    [DllImport("winscard.dll", CharSet = CharSet.Unicode, EntryPoint = "SCardConnectW")]
    private static extern int SCardConnect(IntPtr context, string reader, uint share, uint protocols, out IntPtr card, out uint protocol);
    [DllImport("winscard.dll")] private static extern int SCardDisconnect(IntPtr card, uint disposition);
    [DllImport("winscard.dll", EntryPoint = "SCardStatusW", CharSet = CharSet.Unicode)]
    private static extern int SCardStatus(IntPtr card, IntPtr readerNames, IntPtr readerLength,
        IntPtr state, IntPtr activeProtocol, byte[] atr, ref uint atrLength);
    [StructLayout(LayoutKind.Sequential)] private struct IoRequest { public uint protocol; public uint length; }
    [DllImport("winscard.dll")] private static extern int SCardTransmit(IntPtr card, ref IoRequest sendPci, byte[] send, uint sendLength,
        IntPtr recvPci, byte[] recv, ref uint recvLength);

    public static string[] Readers()
    {
        Check(SCardEstablishContext(2, IntPtr.Zero, IntPtr.Zero, out var context), "เปิดบริการเครื่องอ่านบัตรไม่ได้");
        try
        {
            uint length = 0;
            int rc = SCardListReaders(context, null, null, ref length);
            if (rc != Success || length == 0) return [];
            var chars = new char[length];
            Check(SCardListReaders(context, null, chars, ref length), "ค้นหาเครื่องอ่านบัตรไม่ได้");
            return new string(chars).Split('\0', StringSplitOptions.RemoveEmptyEntries);
        }
        finally { SCardReleaseContext(context); }
    }
    public static CardData Read(string reader, Action<string> progress)
    {
        Check(SCardEstablishContext(2, IntPtr.Zero, IntPtr.Zero, out var context), "เปิดบริการเครื่องอ่านบัตรไม่ได้");
        try
        {
            Check(SCardConnect(context, reader, Shared, T0 | T1, out var card, out var protocol), "ไม่พบบัตรหรือเครื่องอ่านถูกใช้งานอยู่");
            try
            {
                var atr = new byte[32]; uint atrLength = (uint)atr.Length;
                int responseP2 = SCardStatus(card, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, IntPtr.Zero, atr, ref atrLength) == Success
                    && atrLength >= 2 && atr[0] == 0x3b && atr[1] == 0x67 ? 1 : 0;
                var session = new Session(card, protocol, responseP2);
                progress("กำลังเลือกข้อมูลบัตร");
                session.Apdu([0, 0xA4, 4, 0, 8, 0xA0, 0, 0, 0, 0x54, 0x48, 0, 1]);
                progress("กำลังอ่านเลขบัตรและชื่อ");
                var data = new CardData { citizen_id = Encoding.ASCII.GetString(session.Read(4, 13)) };
                if (data.citizen_id.Length != 13 || !data.citizen_id.All(char.IsAsciiDigit)) throw new IOException("เลขบัตรจากชิปไม่ครบ 13 หลัก");
                var thai = Encoding.GetEncoding("windows-874");
                string name = thai.GetString(session.Read(0x11, 100)).Replace('\0', ' ').Trim();
                string[] parts = name.Split('#');
                if (parts.Length < 4) throw new IOException("แยกชื่อจากบัตรไม่ได้");
                data.name_title = parts[0].Trim();
                data.first_name = (parts[1] + " " + parts[2]).Trim();
                data.last_name = parts[3].Trim();
                try
                {
                    data.full_name_en = string.Join(' ', Encoding.ASCII.GetString(session.Read(0x75, 100))
                        .Replace('\0', ' ').Split('#', StringSplitOptions.RemoveEmptyEntries)
                        .Select(part => part.Trim()).Where(part => part.Length > 0));
                }
                catch (IOException) { /* Older cards may not return an English name. */ }
                var rawDate = Encoding.ASCII.GetString(session.Read(0xD9, 8));
                if (rawDate.Length == 8 && rawDate.All(char.IsAsciiDigit))
                {
                    int year = int.Parse(rawDate[..4]) - 543;
                    int month = int.Parse(rawDate.Substring(4, 2));
                    int day = int.Parse(rawDate.Substring(6, 2));
                    if (year is >= 1857 and <= 2257 && month != 0 && day != 0)
                        data.birth_date = new DateTime(year, month, day).ToString("yyyy-MM-dd");
                }
                data.kinship_gender = Encoding.ASCII.GetString(session.Read(0xE1, 1)) switch { "1" => "male", "2" => "female", _ => "" };
                data.card_address = thai.GetString(session.Read(0x1579, 100)).Replace('\0', ' ').Replace('#', ' ').Trim();
                progress("กำลังอ่านรูปจากบัตร");
                try
                {
                    var photo = new List<byte>(5100);
                    for (int block = 0; block < 20; block++) photo.AddRange(session.Read(0x17B + block * 255, 255));
                    int end = -1;
                    for (int n = 2; n < photo.Count - 1; n++) if (photo[n] == 0xff && photo[n + 1] == 0xd9) { end = n + 2; break; }
                    if (photo[0] == 0xff && photo[1] == 0xd8 && end > 0)
                        data.avatar_image = "data:image/jpeg;base64," + Convert.ToBase64String(photo.Take(end).ToArray());
                }
                catch (IOException) { /* Name and ID remain available if photo read fails. */ }
                return data;
            }
            finally { SCardDisconnect(card, Leave); }
        }
        finally { SCardReleaseContext(context); }
    }
    private static void Check(int code, string message) { if (code != Success) throw new IOException($"{message} (0x{code:X8})"); }
    private sealed class Session(IntPtr card, uint protocol, int responseP2)
    {
        private byte[] Exchange(byte[] command)
        {
            var pci = new IoRequest { protocol = protocol, length = 8 };
            var response = new byte[8192]; uint size = (uint)response.Length;
            Check(SCardTransmit(card, ref pci, command, (uint)command.Length, IntPtr.Zero, response, ref size), "ส่งคำสั่งไปยังบัตรไม่ได้");
            if (size < 2 || size > response.Length) throw new IOException("คำตอบบัตรไม่ครบ");
            return response[..(int)size];
        }
        public byte[] Apdu(byte[] command)
        {
            using var bytes = new MemoryStream();
            for (int loop = 0; loop < 12; loop++)
            {
                var reply = Exchange(command); int sw1 = reply[^2], sw2 = reply[^1];
                if (sw1 == 0x6c && command.Length == 5) { command = [.. command]; command[^1] = (byte)sw2; continue; }
                bytes.Write(reply, 0, reply.Length - 2);
                if (bytes.Length > 8192) throw new IOException("คำตอบบัตรใหญ่เกินกำหนด");
                if (sw1 == 0x90 && sw2 == 0) return bytes.ToArray();
                if (sw1 == 0x61) { command = [0, 0xc0, 0, (byte)responseP2, (byte)sw2]; continue; }
                throw new IOException($"บัตรตอบรหัส {sw1:X2}{sw2:X2}");
            }
            throw new IOException("บัตรส่งคำตอบต่อเนื่องเกินกำหนด");
        }
        public byte[] Read(int offset, int count)
        {
            var result = Apdu([(byte)0x80, (byte)0xb0, (byte)(offset >> 8), (byte)offset, 2, 0, (byte)count]);
            if (result.Length != count) throw new IOException("ข้อมูลจากบัตรไม่ครบ");
            return result;
        }
    }
}
