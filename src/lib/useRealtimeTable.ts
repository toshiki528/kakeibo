"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

/**
 * Supabase Realtime でテーブルの変更を購読し、変更時にコールバックを呼ぶフック。
 */
export function useRealtimeTable(
  table: string,
  filter: { column: string; value: string | number } | undefined,
  onChanged: () => void
) {
  useEffect(() => {
    const channelName = filter
      ? `${table}_${filter.column}_${filter.value}`
      : table;

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table,
          ...(filter ? { filter: `${filter.column}=eq.${filter.value}` } : {}),
        },
        () => {
          onChanged();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, filter?.column, filter?.value, onChanged]);
}
