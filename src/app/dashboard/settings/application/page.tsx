'use client';

import { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Settings, Key } from 'lucide-react';
import { useToast } from '@/hooks/useToast';
import { supabaseClient } from '@/lib/supabase/client';
import Button from '@components/ui/Button';
import Input from '@components/ui/Input';

export default function ApplicationSettings() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'app' | 'keys'>('app');
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState<any>({
    app_name: '', nama_desa: '', alamat_kantor: '', kontak_support: '', 
    is_maintenance: false, is_debug: false, version: '1.0.0'
  });
  const [apiKeys, setApiKeys] = useState<{ key_name: string; key_value: string }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data: setRes } = await supabaseClient.from('settings').select('*').eq('id', 1).single();
    const { data: keyRes } = await supabaseClient.from('app_keys').select('*');
    if (setRes) setSettings(setRes);
    if (keyRes) setApiKeys(keyRes);
  };

  const handleSave = async () => {
  setLoading(true);
  try {
    const { error: setErr } = await supabaseClient.from('settings').upsert({ id: 1, ...settings });
    if (setErr) throw setErr;

    await supabaseClient.from('app_keys').delete().neq('id', 0); 
    
    if (apiKeys.length > 0) {
      const sanitizedKeys = apiKeys.map(({ key_name, key_value }) => ({
        key_name,
        key_value
      }));
      
      const { error: keyErr } = await supabaseClient.from('app_keys').insert(sanitizedKeys);
      if (keyErr) throw keyErr;
    }
    
    showToast('success', 'Berhasil', 'Pengaturan Aplikasi telah diperbarui.');
    fetchData(); 
  } catch (e: any) {
    console.error(e); 
    showToast('error', 'Gagal', e.message || 'Terjadi kesalahan sistem.');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pengaturan Aplikasi</h1>
            <p className="text-sm text-slate-500 mt-1">Pusat manajemen konten dan informasi resmi desa.</p>
        </div>
            <Button onClick={handleSave} loading={loading} leftIcon={<Save className="w-4 h-4" />}>
             Simpan Perubahan
            </Button>
        </div>

      <div className="flex gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <Button
            size="sm"
            variant={activeTab === 'app' ? 'primary' : 'secondary'}
            
            onClick={() => setActiveTab('app')}
            leftIcon={<Settings className="w-4 h-4" />}
        >
            Application
        </Button>

        <Button
            size="sm"
            variant={activeTab === 'keys' ? 'primary' : 'secondary'}
            onClick={() => setActiveTab('keys')}
            leftIcon={<Key className="w-4 h-4" />}
        >
            App Keys
        </Button>
        </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        {activeTab === 'app' ? (
          <div className="space-y-4">
            <Input label="Nama Aplikasi" value={settings.app_name} onChange={(e) => setSettings({...settings, app_name: e.target.value})} />
            <Input label="Nama Desa" value={settings.nama_desa} onChange={(e) => setSettings({...settings, nama_desa: e.target.value})} />
            <Input label="Alamat Kantor" value={settings.alamat_kantor} onChange={(e) => setSettings({...settings, alamat_kantor: e.target.value})} />
            <Input label="Kontak Support" value={settings.kontak_support} onChange={(e) => setSettings({...settings, kontak_support: e.target.value})} />
            <Input label="Versi Aplikasi" value={settings.version} onChange={(e) => setSettings({...settings, version: e.target.value})} />
            
            <div className="grid grid-cols-2 gap-4 pt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-md">
                <input type="checkbox" checked={settings.is_maintenance} onChange={(e) => setSettings({...settings, is_maintenance: e.target.checked})} />
                Maintenance Mode
              </label>
              <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-slate-50 p-3 rounded-md">
                <input type="checkbox" checked={settings.is_debug} onChange={(e) => setSettings({...settings, is_debug: e.target.checked})} />
                Debug Mode
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-slate-900 tracking-tight">Daftar API Keys</h2>
                <p className="text-sm text-slate-500 mt-1">Kelola API keys yang digunakan pada aplikasi.</p>
            </div>
              <Button variant="outline" onClick={() => setApiKeys([...apiKeys, { key_name: '', key_value: '' }])}
                leftIcon={<Plus className='w-4 h-4'/>}> Tambah API Key
              </Button>
            </div>
            {apiKeys.map((item, idx) => (
              <div key={idx} className="flex gap-2">
                <div className="w-1/3"><Input placeholder="Nama Key (Contoh: whatsapp_api)" value={item.key_name} onChange={(e) => { const n = [...apiKeys]; n[idx].key_name = e.target.value; setApiKeys(n); }} /></div>
                <div className="flex-1"><Input placeholder="Value / Token" value={item.key_value} onChange={(e) => { const n = [...apiKeys]; n[idx].key_value = e.target.value; setApiKeys(n); }} /></div>
                <Button 
                variant="danger" 
                size="sm" 
                leftIcon={<Trash2 className='w-4 h-4' />} 
                onClick={() => setApiKeys(apiKeys.filter((_, i) => i !== idx))}
                >
                    {""}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}