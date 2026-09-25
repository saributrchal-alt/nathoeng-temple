import React, { useEffect, useRef, useState } from 'react';

function compressPhoto(canvas) {
  for (const quality of [0.78, 0.65, 0.5, 0.35, 0.2]) {
    const photo = canvas.toDataURL('image/jpeg', quality);
    if (photo.length <= 100000) return photo;
  }
  return null;
}

export default function MemberPhotoEditor({ initialPhoto = '', onChange, lang = 'th' }) {
  const th = lang === 'th';
  const [source, setSource] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [preview, setPreview] = useState(initialPhoto);
  const [error, setError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraBusy, setCameraBusy] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [selectedCameraId, setSelectedCameraId] = useState('');
  const video = useRef(null);
  const stream = useRef(null);
  const canvas = useRef(null);
  const serial = useRef(0);
  const cameraRequest = useRef(0);
  const onChangeRef = useRef(onChange);

  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);

  useEffect(() => {
    if (!initialPhoto) return;
    const img = new Image();
    img.onload = () => { setSource(img); setPreview(''); };
    img.onerror = () => {
      setError(th ? 'เปิดรูปจากบัตรไม่ได้ กรุณาเลือกรูปใหม่' : 'Card photo could not be opened. Choose another photo.');
      onChangeRef.current('');
    };
    img.src = initialPhoto;
  }, [initialPhoto, th]);
  useEffect(() => {
    if (!source || !canvas.current) return;
    const c = canvas.current;
    const size = Math.min(source.width, source.height) / zoom;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 256, 256);
    ctx.drawImage(source, (source.width - size) * x / 100,
      (source.height - size) * y / 100, size, size, 0, 0, 256, 256);
    const photo = compressPhoto(c);
    if (photo) {
      setError('');
      onChangeRef.current(photo);
    } else {
      setError(th ? 'รูปยังใหญ่เกินไป กรุณาเลือกรูปอื่น' : 'Photo is too large. Choose another photo.');
      onChangeRef.current('');
    }
  }, [source, zoom, x, y, th]);
  useEffect(() => () => {
    serial.current += 1;
    cameraRequest.current += 1;
    stream.current?.getTracks().forEach((track) => track.stop());
  }, []);
  useEffect(() => {
    if (cameraOpen && video.current && stream.current) {
      video.current.srcObject = stream.current;
      video.current.play().catch(() => {});
    }
  }, [cameraOpen]);

  async function refreshCameras() {
    const devices = await navigator.mediaDevices?.enumerateDevices?.();
    const found = (devices || []).filter((device) => device.kind === 'videoinput' && device.deviceId);
    setCameras(found.map((device, index) => ({
      id: device.deviceId,
      label: device.label || (th ? 'กล้อง ' : 'Camera ') + (index + 1)
    })));
    return found;
  }
  useEffect(() => {
    refreshCameras().catch(() => {});
    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.addEventListener) return undefined;
    const onDeviceChange = () => { refreshCameras().catch(() => {}); };
    mediaDevices.addEventListener('devicechange', onDeviceChange);
    return () => mediaDevices.removeEventListener('devicechange', onDeviceChange);
  }, [th]);

  function cameraError(error) {
    if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError')
      return th ? 'Chrome ไม่ได้รับอนุญาตใช้กล้อง กดไอคอนข้างที่อยู่เว็บเพื่ออนุญาตกล้อง แล้วลองใหม่' : 'Allow camera access in Chrome using the icon beside the site address, then try again.';
    if (error?.name === 'NotFoundError' || error?.name === 'OverconstrainedError')
      return th ? 'Chrome ไม่พบกล้องนี้ เปิด Iriun Webcam บนโทรศัพท์และคอมพิวเตอร์ให้เชื่อมกัน แล้วกดค้นหากล้องอีกครั้ง' : 'Camera not found. Connect Iriun Webcam on the phone and computer, then refresh the camera list.';
    if (error?.name === 'NotReadableError' || error?.name === 'AbortError')
      return th ? 'กล้องถูกใช้งานอยู่หรือ Iriun ยังไม่ส่งภาพ ปิดโปรแกรมอื่นที่ใช้กล้อง ตรวจการเชื่อมต่อ แล้วลองใหม่' : 'The camera is busy or Iriun is not sending video. Close other camera apps and reconnect.';
    return th ? 'เปิดกล้องไม่ได้ กรุณาตรวจ Iriun และสิทธิ์กล้องใน Chrome หรือเลือกไฟล์รูป' : 'Camera unavailable. Check Iriun and Chrome permissions, or choose a photo file.';
  }

  function select(file) {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 10 * 1024 * 1024) {
      setError(th ? 'เลือก JPG, PNG หรือ WebP ขนาดไม่เกิน 10 MB' : 'Choose a JPG, PNG or WebP under 10 MB.');
      return;
    }
    const id = ++serial.current;
    setError('');
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      if (id !== serial.current) return;
      setSource(img); setZoom(1); setX(50); setY(50);
    };
    img.onerror = () => { URL.revokeObjectURL(url); setError(th ? 'เปิดภาพไม่ได้' : 'Unable to open image.'); };
    img.src = url;
  }
  function closeCamera() {
    cameraRequest.current += 1;
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setCameraBusy(false);
    setCameraOpen(false);
  }
  async function openCamera(deviceId = '') {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(th ? 'Chrome เปิดกล้องไม่ได้ กรุณาใช้ HTTPS และอนุญาตกล้องในเบราว์เซอร์' : 'Camera access requires HTTPS and browser permission.');
      return;
    }
    const request = ++cameraRequest.current;
    setCameraBusy(true);
    setError('');
    try {
      const known = await refreshCameras().catch(() => []);
      const preferred = !deviceId && known.find((device) => /iriun/i.test(device.label));
      let wanted = deviceId || preferred?.deviceId || '';
      let media;
      try {
        media = await navigator.mediaDevices.getUserMedia({
          video: wanted ? { deviceId: { exact: wanted } } : true, audio: false
        });
      } catch (error) {
        if (!deviceId && wanted && ['NotFoundError', 'OverconstrainedError', 'NotReadableError'].includes(error.name)) {
          wanted = '';
          media = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        } else throw error;
      }
      if (request !== cameraRequest.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      const available = await refreshCameras().catch(() => []);
      if (!deviceId && !wanted) {
        const iriun = available.find((device) => /iriun/i.test(device.label));
        if (iriun && media.getVideoTracks()[0]?.getSettings()?.deviceId !== iriun.deviceId) {
          try {
            const preferredMedia = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: { exact: iriun.deviceId } }, audio: false
            });
            if (request !== cameraRequest.current) {
              preferredMedia.getTracks().forEach((track) => track.stop());
              media.getTracks().forEach((track) => track.stop());
              return;
            }
            media.getTracks().forEach((track) => track.stop());
            media = preferredMedia;
            wanted = iriun.deviceId;
          } catch { /* Keep the working default camera. */ }
        }
      }
      if (request !== cameraRequest.current) {
        media.getTracks().forEach((track) => track.stop());
        return;
      }
      stream.current?.getTracks().forEach((track) => track.stop());
      stream.current = media;
      setSelectedCameraId(media.getVideoTracks()[0]?.getSettings()?.deviceId || wanted);
      setCameraOpen(true);
      if (video.current) {
        video.current.srcObject = media;
        video.current.play().catch(() => {
          if (request === cameraRequest.current) setError(cameraError());
        });
      }
    } catch (error) {
      if (request === cameraRequest.current) setError(cameraError(error));
    } finally {
      if (request === cameraRequest.current) setCameraBusy(false);
    }
  }
  function capture() {
    const v = video.current;
    if (!v?.videoWidth) return;
    const c = document.createElement('canvas');
    const ratio = Math.min(1, 1600 / Math.max(v.videoWidth, v.videoHeight));
    c.width = Math.round(v.videoWidth * ratio); c.height = Math.round(v.videoHeight * ratio);
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    c.toBlob((blob) => blob && select(new File([blob], 'camera.jpg', { type: 'image/jpeg' })), 'image/jpeg', .9);
    closeCamera();
  }
  function saveCrop() {
    const photo = compressPhoto(canvas.current);
    if (!photo) { setError(th ? 'รูปยังใหญ่เกินไป' : 'Image is still too large.'); return; }
    setPreview(photo); onChange(photo); setSource(null);
  }
  const field = { display: 'grid', gap: 5, margin: '9px 0' };
  return <fieldset style={{ border: '1px solid #ded2bd', borderRadius: 12, padding: 15 }}>
    <legend>{th ? 'รูปโปรไฟล์' : 'Profile picture'}</legend>
    {preview && <img src={preview} alt={th ? 'ตัวอย่างรูปโปรไฟล์' : 'Profile preview'} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }} />}
    <label style={field}>{th ? 'เลือกรูปจากเครื่อง' : 'Choose a photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { select(e.target.files?.[0]); e.target.value = ''; }} /></label>
    <div style={{ display: 'flex', gap: 8, alignItems: 'end', flexWrap: 'wrap', margin: '10px 0' }}>
      <label style={{ ...field, flex: '1 1 200px' }}>{th ? 'เลือกกล้อง (รวม Iriun Webcam)' : 'Choose camera (including Iriun Webcam)'}
        <select value={selectedCameraId} onChange={(event) => {
          const id = event.target.value;
          setSelectedCameraId(id);
          if (cameraOpen) openCamera(id);
        }} style={{ minHeight: 40, maxWidth: '100%' }}>
          <option value="">{th ? 'อัตโนมัติ (เลือก Iriun ก่อน)' : 'Automatic (prefer Iriun)'}</option>
          {cameras.map((device) => <option key={device.id} value={device.id}>{device.label}</option>)}
        </select>
      </label>
      <button type="button" onClick={async () => {
        try {
          const found = await refreshCameras();
          setError(found.length ? '' : cameraError({ name: 'NotFoundError' }));
        } catch (err) { setError(cameraError(err)); }
      }}>{th ? 'ค้นหากล้องอีกครั้ง' : 'Refresh cameras'}</button>
    </div>
    {cameraOpen ? <div><video ref={video} autoPlay playsInline muted style={{ maxWidth: '100%', width: 280, borderRadius: 12 }} /><div><button type="button" disabled={cameraBusy} onClick={capture}>{th ? 'ถ่ายรูป' : 'Capture'}</button> <button type="button" onClick={closeCamera}>{th ? 'ปิดกล้อง' : 'Close camera'}</button></div></div>
      : <button type="button" disabled={cameraBusy} onClick={() => openCamera(selectedCameraId)}>{cameraBusy ? (th ? 'กำลังเปิดกล้อง...' : 'Opening camera...') : (th ? 'เปิดกล้องถ่ายรูป' : 'Open camera')}</button>}
    {source && <div style={{ marginTop: 12 }}>
      <canvas ref={canvas} width="256" height="256" aria-label={th ? 'ตัวอย่างภาพครอบวงกลม' : 'Circular crop preview'} style={{ width: 200, height: 200, maxWidth: '100%', borderRadius: '50%' }} />
      {[[th ? 'ซูม' : 'Zoom', zoom, setZoom, 1, 3, .01], [th ? 'เลื่อนซ้าย–ขวา' : 'Left/right', x, setX, 0, 100, 1], [th ? 'เลื่อนขึ้น–ลง' : 'Up/down', y, setY, 0, 100, 1]].map(([label, value, setter, min, max, step]) => <label key={label} style={field}>{label}<input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setter(Number(e.target.value))} /></label>)}
      <button type="button" onClick={saveCrop}>{th ? 'เสร็จสิ้นการปรับรูป' : 'Finish adjusting photo'}</button>
    </div>}
    {error && <p role="alert" style={{ color: '#a23f34' }}>{error}</p>}
  </fieldset>;
}
