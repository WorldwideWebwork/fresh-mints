<script lang="ts">
  import type { SkipTraceResult } from '../../types/lead';
  import Badge from '../atoms/Badge.svelte';
  import { Phone, Mail, ExternalLink, MapPin } from 'lucide-svelte';

  interface Props {
    data?: SkipTraceResult;
  }

  let { data }: Props = $props();
</script>

<div class="flex flex-wrap items-center gap-1.5">
  {#if data?.verifiedPhone}
    <Badge variant="success" class="gap-1">
      <Phone class="w-3 h-3 text-emerald-400" />
      <span>{data.verifiedPhone}</span>
    </Badge>
  {/if}

  {#if data?.primaryEmail}
    <Badge variant="info" class="gap-1 max-w-[180px] truncate">
      <Mail class="w-3 h-3 text-sky-400 flex-shrink-0" />
      <span>{data.primaryEmail}</span>
    </Badge>
  {/if}

  {#if data?.linkedInUrl}
    <a
      href={data.linkedInUrl.startsWith('http') ? data.linkedInUrl : `https://${data.linkedInUrl}`}
      target="_blank"
      rel="noopener noreferrer"
      class="inline-flex"
      onclick={(e) => e.stopPropagation()}
    >
      <Badge variant="default" class="gap-1 hover:border-sky-500 transition-colors">
        <ExternalLink class="w-3 h-3 text-sky-400" />
        <span>Profile</span>
      </Badge>
    </a>
  {/if}

  {#if !data?.verifiedPhone && !data?.primaryEmail}
    <span class="text-xs text-slate-400 dark:text-slate-400 italic">No contact verified</span>
  {/if}
</div>
