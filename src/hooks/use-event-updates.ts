import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
export function useEventUpdates() {
  const cache=useQueryClient();
  useEffect(()=>{
    const refresh=()=>{ for(const key of ['settings','matches','controls','totals','admin-data'])void cache.invalidateQueries({queryKey:[key]}); };
    const channel=supabase.channel(`event-${crypto.randomUUID()}`);
    for(const table of ['event_settings','matches','voting_controls'])channel.on('postgres_changes',{event:'*',schema:'public',table},refresh);
    channel.subscribe();
    return ()=>{void supabase.removeChannel(channel);};
  },[cache]);
}