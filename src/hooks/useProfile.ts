import { useEffect, useState } from 'react';
import { loadProfile, PROFILE_EVENT, saveProfile, type Profile } from '../lib/profile';

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(loadProfile);

  useEffect(() => {
    const sync = () => setProfile(loadProfile());
    window.addEventListener(PROFILE_EVENT, sync);
    return () => window.removeEventListener(PROFILE_EVENT, sync);
  }, []);

  /** salva e devolve uma mensagem de erro se o armazenamento falhar */
  const save = (p: Profile): string | null => {
    try {
      saveProfile(p);
      setProfile(p);
      return null;
    } catch {
      return 'Não foi possível salvar. Tente usar uma logo menor.';
    }
  };

  return { profile, save };
}
