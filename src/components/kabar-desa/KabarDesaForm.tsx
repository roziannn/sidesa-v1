'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { supabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/useToast';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input'; 
import FileUpload, { UploadedFile } from '@/components/ui/FileUpload';
import { Save } from 'lucide-react';
import Select from '@components/ui/Select';
import TiptapEditor from '@components/ui/TiptapEditor';

const kabarSchema = z.object({
  judul: z.string().min(5, 'Judul minimal 5 karakter'),
  konten: z.string().min(20, 'Konten minimal 20 karakter'),
  kategori: z.string().min(1, 'Pilih kategori'),
});

export default function KabarDesaForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const { showToast } = useToast();

  const [judul, setJudul] = useState('');
  const [konten, setKonten] = useState('');
  const [kategori, setKategori] = useState('berita');
  const [status, setStatus] = useState('draft');
  const [isDisplayed, setIsDisplayed] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setJudul(initialData.judul || '');
      setKonten(initialData.konten || '');
      setKategori(initialData.kategori || 'berita');
      setStatus(initialData.status || 'draft');
      setIsDisplayed(initialData.is_displayed ?? false);
      
      if (initialData.thumbnail_url) {
        setFiles([{ 
          file: null, 
          preview: initialData.thumbnail_url,
          isPdf: false 
        }]);
      }
    }
  }, [initialData]);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabaseClient.auth.getSession();
      if (data.session) setUserId(data.session.user.id);
    };
    getSession();
  }, []);

  const handleSubmit = async () => {
  const result = kabarSchema.safeParse({ judul, konten, kategori });
  if (!result.success) {
    showToast('warning', 'Validasi Gagal', result.error.issues[0].message);
    return;
  }

  if (!userId) {
    showToast('error', 'Gagal', 'Anda harus login.');
    return;
  }

  setLoading(true);

  const deleteFileFromStorage = async (url: string) => {
    try {
      const urlParts = url.split('/');
      const bucketIndex = urlParts.indexOf('kabar-desa');
      if (bucketIndex !== -1) {
        const path = urlParts.slice(bucketIndex + 1).join('/');
        const { error } = await supabaseClient.storage.from('kabar-desa').remove([path]);
        if (error) console.error("Error saat hapus storage:", error);
      }
    } catch (err) {
      console.error("Gagal menghapus file lama:", err);
    }
  };

  try {
    let thumbnailUrl = initialData?.thumbnail_url || null;

    if (files.length === 0 && initialData?.thumbnail_url) {
      await deleteFileFromStorage(initialData.thumbnail_url);
      thumbnailUrl = null;
    } 
    
    // if ganti/upload baru
    else if (files.length > 0 && files[0].file) {
      const file = files[0].file;
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      const { error: uploadError } = await supabaseClient.storage
        .from('kabar-desa')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // get URL publik
      const { data: urlData } = supabaseClient.storage
        .from('kabar-desa')
        .getPublicUrl(fileName);
      
      thumbnailUrl = urlData.publicUrl;

      // if sebelumnya ada gambar, hapus yang lama
      if (initialData?.thumbnail_url) {
        await deleteFileFromStorage(initialData.thumbnail_url);
      }
    }

    const payload = {
      judul,
      slug: judul.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      konten,
      kategori,
      status,
      is_displayed: isDisplayed,
      thumbnail_url: thumbnailUrl,
      author_id: userId
    };

    if (initialData) {
      const { error } = await supabaseClient
        .from('kabar_desa')
        .update(payload)
        .eq('id', initialData.id);
      if (error) throw error;
      showToast('success', 'Berhasil', 'Kabar diperbarui.');
    } else {
      const { error } = await supabaseClient
        .from('kabar_desa')
        .insert([payload]);
      if (error) throw error;
      showToast('success', 'Berhasil', 'Kabar dibuat.');
    }

    router.push('/dashboard/kabar-desa');
    router.refresh();
  } catch (error: any) {
    console.error("Submit Error:", error);
    showToast('error', 'Gagal', error.message || 'Gagal menyimpan data.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
      <FileUpload 
        label="Thumbnail Berita" 
        files={files} 
        onChange={setFiles} 
        maxFiles={1} 
        accept="image/*" 
      />

      <div className="space-y-4">
        <Input label="Judul" value={judul} onChange={(e) => setJudul(e.target.value)} required />
        
        <div className="grid grid-cols-2 gap-4">
          <Select label="Kategori" value={kategori} onChange={(e) => setKategori(e.target.value)}>
            <option value="berita">Berita</option>
            <option value="pengumuman">Pengumuman</option>
          </Select>
          <Select label="Status" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Konten</label>
          <TiptapEditor value={konten} onChange={setKonten} />
        </div>

        <div className="flex items-center gap-2 py-2">
          <input 
            type="checkbox" 
            checked={isDisplayed} 
            onChange={(e) => setIsDisplayed(e.target.checked)} 
            className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500" 
          />
          <label className="text-sm font-semibold text-slate-700">Tampilkan di Landing Page</label>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-slate-100">
        <Button onClick={handleSubmit} loading={loading} disabled={loading} leftIcon={<Save className='w-4 h-4'/>}>
          {initialData ? 'Perbarui Kabar' : 'Simpan Kabar'}
        </Button>
      </div>
    </div>
  );
}