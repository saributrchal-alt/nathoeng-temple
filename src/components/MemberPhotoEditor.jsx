import React, { useEffect, useRef, useState } from 'react';

export default function MemberPhotoEditor({ initialPhoto = '', onChange, lang = 'th' }) {
  const th = lang === 'th';
  const [source, setSource] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const [preview, setPreview] = useState(initialPhoto);
  const [error, setError] = useState('');
  const [cameraOpen, setCameraOpen] = useState(false);
  const video = useRef(null);
  const stream = useRef(null);
  const canvas = useRef(null);
  const serial = useRef(0);

  useEffect(() => {
    if (!initialPhoto) return;
    const img = new Image();
    img.onload = () => { setSource(img); setPreview(''); };
    img.src = initialPhoto;
  }, [initialPhoto]);
  useEffect(() => {
    if (!source || !canvas.current) return;
    const c = canvas.current;
    const size = Math.min(source.width, source.height) / zoom;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, 256, 256);
    ctx.drawImage(source, (source.width - size) * x / 100,
      (source.height - size) * y / 100, size, size, 0, 0, 256, 256);
  }, [source, zoom, x, y]);
  useEffect(() => () => {
    serial.current += 1;
    stream.current?.getTracks().forEach((track) => track.stop());
  }, []);
  useEffect(() => {
    if (cameraOpen && video.current && stream.current) {
      video.current.srcObject = stream.current;
      video.current.play().catch(() => {});
    }
  }, [cameraOpen]);

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
    stream.current?.getTracks().forEach((track) => track.stop());
    stream.current = null;
    setCameraOpen(false);
  }
  async function openCamera() {
    setError('');
    try {
      const media = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      stream.current = media;
      setCameraOpen(true);
    } catch {
      setError(th ? 'เปิดกล้องไม่ได้ กรุณาอนุญาตใช้กล้องหรือเลือกไฟล์รูป' : 'Camera unavailable. Allow access or choose a file.');
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
    const photo = canvas.current.toDataURL('image/jpeg', .78);
    if (photo.length > 100000) { setError(th ? 'รูปยังใหญ่เกินไป' : 'Image is still too large.'); return; }
    setPreview(photo); onChange(photo); setSource(null);
  }
  const field = { display: 'grid', gap: 5, margin: '9px 0' };
  return <fieldset style={{ border: '1px solid #ded2bd', borderRadius: 12, padding: 15 }}>
    <legend>{th ? 'รูปโปรไฟล์' : 'Profile picture'}</legend>
    {preview && <img src={preview} alt={th ? 'ตัวอย่างรูปโปรไฟล์' : 'Profile preview'} style={{ width: 90, height: 90, borderRadius: '50%', objectFit: 'cover' }} />}
    <label style={field}>{th ? 'เลือกรูปจากเครื่อง' : 'Choose a photo'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => { select(e.target.files?.[0]); e.target.value = ''; }} /></label>
    {cameraOpen ? <div><video ref={video} autoPlay playsInline muted style={{ maxWidth: '100%', width: 280, borderRadius: 12 }} /><div><button type="button" onClick={capture}>{th ? 'ถ่ายรูป' : 'Capture'}</button> <button type="button" onClick={closeCamera}>{th ? 'ปิดกล้อง' : 'Close camera'}</button></div></div>
      : <button type="button" onClick={openCamera}>{th ? 'เปิดกล้องถ่ายรูป' : 'Open camera'}</button>}
    {source && <div style={{ marginTop: 12 }}>
      <canvas ref={canvas} width="256" height="256" aria-label={th ? 'ตัวอย่างภาพครอบวงกลม' : 'Circular crop preview'} style={{ width: 200, height: 200, maxWidth: '100%', borderRadius: '50%' }} />
      {[[th ? 'ซูม' : 'Zoom', zoom, setZoom, 1, 3, .01], [th ? 'เลื่อนซ้าย–ขวา' : 'Left/right', x, setX, 0, 100, 1], [th ? 'เลื่อนขึ้น–ลง' : 'Up/down', y, setY, 0, 100, 1]].map(([label, value, setter, min, max, step]) => <label key={label} style={field}>{label}<input type="range" min={min} max={max} step={step} value={value} onChange={(e) => setter(Number(e.target.value))} /></label>)}
      <button type="button" onClick={saveCrop}>{th ? 'ใช้รูปนี้ (บีบอัด 256 × 256)' : 'Use this photo (256 × 256)'}</button>
    </div>}
    {error && <p role="alert" style={{ color: '#a23f34' }}>{error}</p>}
  </fieldset>;
}
