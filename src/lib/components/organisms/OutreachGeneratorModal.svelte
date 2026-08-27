<script lang="ts">
  import { type Lead, PROFESSION_CONFIGS, W4_HOSTING_PLANS } from '../../types/lead';
  import { leadStore } from '../../stores/lead-store.svelte';
  import { toast } from '../../stores/toast.svelte';
  import { OUTREACH_TEMPLATES, generateFallbackOutreach } from '../../services/outreach-generator';
  import Dialog from '../atoms/Dialog.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import { Send, Sparkles, Copy, Mail, MessageSquare, Check, RotateCw } from 'lucide-svelte';

  interface Props {
    open?: boolean;
    lead?: Lead | null;
    onclose?: () => void;
  }

  let { open = $bindable(false), lead = null, onclose }: Props = $props();

  let selectedTemplateId = $state('industry_board_pass');
  let activeTab = $state<'email' | 'sms'>('email');
  let isGeneratingAI = $state(false);
  let emailSubject = $state('');
  let emailBody = $state('');
  let smsBody = $state('');
  let copied = $state(false);

  $effect(() => {
    if (lead) {
      regenerateCopy();
    }
  });

  function regenerateCopy() {
    if (!lead) return;
    const fallback = generateFallbackOutreach(lead, selectedTemplateId, lead.estimatedDealValue);
    emailSubject = fallback.subject;
    emailBody = fallback.emailBody;
    smsBody = fallback.smsBody;
  }

  async function generateWithGeminiAI() {
    if (!lead) return;
    isGeneratingAI = true;
    try {
      const restRoot = (window as any).wpApiSettings?.root || '/wp-json/';
      const nonce = (window as any).wpApiSettings?.nonce || '';
      const endpoint = `${restRoot.replace(/\/$/, '')}/xophz-freshmints/v1/gemini/generate`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce,
        },
        body: JSON.stringify({
          action: 'generatePitch',
          payload: {
            leadName: lead.fullName,
            profession: lead.profession,
            state: lead.state,
            city: lead.city,
            school: lead.collegeOrSchool,
            dealValue: lead.estimatedDealValue,
            templateId: selectedTemplateId,
            channel: activeTab,
          },
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const json = await res.json();
      if (json.success && json.data) {
        if (activeTab === 'email') {
          if (json.data.subject) emailSubject = json.data.subject;
          if (json.data.body) emailBody = json.data.body;
        } else {
          if (json.data.body) smsBody = json.data.body;
        }
        toast.success('Generated tailored pitch via Gemini AI!');
      } else {
        throw new Error(json.message || 'AI generation failed');
      }
    } catch (e: any) {
      console.warn('AI generation error, used standard dynamic template:', e);
      toast.warning('Gemini AI unavailable', 'Loaded dynamic high-conversion rule template instead.');
    } finally {
      isGeneratingAI = false;
    }
  }

  import { copyTextToClipboard } from '../../services/clipboard';

  async function handleCopy() {
    const text = activeTab === 'email' ? `Subject: ${emailSubject}\n\n${emailBody}` : smsBody;
    const success = await copyTextToClipboard(text);
    if (success) {
      copied = true;
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        copied = false;
      }, 2000);
    }
  }

  async function handleMarkSent() {
    if (!lead) return;
    const content = activeTab === 'email' ? emailBody : smsBody;
    await leadStore.recordOutreachLog(lead.id, {
      type: activeTab,
      subject: activeTab === 'email' ? emailSubject : undefined,
      content,
      status: 'sent',
      toneUsed: selectedTemplateId,
    });
    toast.success(`Marked as sent to ${lead.fullName}`);
    open = false;
    onclose?.();
  }
</script>

<Dialog bind:open {onclose} title="AI Outreach Pitch & Pitch Deck Generator" description="Generate personalized email and SMS pitches powered by Google Gemini and WP Connectors" maxWidth="max-w-3xl">
  {#if lead}
    <div class="space-y-5">
      <!-- Template Selector -->
      <div>
        <label class="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-2">Select Angle / Strategy:</label>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {#each OUTREACH_TEMPLATES as tmpl}
            <!-- svelte-ignore a11y_click_events_have_key_events -->
            <!-- svelte-ignore a11y_no_static_element_interactions -->
            <div
              class="p-3 rounded-xl border text-left cursor-pointer transition-all {selectedTemplateId === tmpl.id ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/80 shadow-md shadow-emerald-950/50' : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 hover:border-slate-200 dark:border-slate-800'}"
              onclick={() => {
                selectedTemplateId = tmpl.id;
                regenerateCopy();
              }}
            >
              <div class="flex items-center justify-between gap-2 mb-1">
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200">{tmpl.name}</span>
                <Badge variant={selectedTemplateId === tmpl.id ? 'success' : 'default'} class="text-[10px]">{tmpl.badge}</Badge>
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{tmpl.description}</p>
            </div>
          {/each}
        </div>
      </div>

      <!-- Medium Switcher & AI Button -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div class="flex items-center gap-2 p-1 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer {activeTab === 'email' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'}"
            onclick={() => (activeTab = 'email')}
          >
            <Mail class="w-3.5 h-3.5" />
            <span>Cold Email Pitch</span>
          </button>
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer {activeTab === 'sms' ? 'bg-emerald-600 text-white shadow' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:text-slate-200'}"
            onclick={() => (activeTab = 'sms')}
          >
            <MessageSquare class="w-3.5 h-3.5" />
            <span>SMS Pitch</span>
          </button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onclick={generateWithGeminiAI}
          loading={isGeneratingAI}
          class="gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 border-emerald-800/80 hover:bg-emerald-50 dark:bg-emerald-950/40"
        >
          <Sparkles class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
          <span>Generate with Gemini 3.7</span>
        </Button>
      </div>

      <!-- Content Area -->
      {#if activeTab === 'email'}
        <div class="space-y-3">
          <div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Subject Line:</label>
            <input
              type="text"
              bind:value={emailSubject}
              class="w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2 text-xs font-semibold focus:outline-none focus:border-emerald-500/80"
            />
          </div>

          <div>
            <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">Email Body:</label>
            <textarea
              bind:value={emailBody}
              rows={9}
              class="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs leading-relaxed font-sans focus:outline-none focus:border-emerald-500/80 custom-scrollbar"
            ></textarea>
          </div>
        </div>
      {:else}
        <div>
          <label class="text-xs font-medium text-slate-500 dark:text-slate-400 block mb-1">SMS Message ({smsBody.length} chars):</label>
          <textarea
            bind:value={smsBody}
            rows={5}
            class="w-full bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 text-xs leading-relaxed font-sans focus:outline-none focus:border-emerald-500/80 custom-scrollbar"
          ></textarea>
        </div>
      {/if}

      <!-- Bottom Action Bar -->
      <div class="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <Button variant="outline" size="sm" onclick={handleCopy} class="gap-1.5 text-xs">
          {#if copied}
            <Check class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Copied!</span>
          {:else}
            <Copy class="w-3.5 h-3.5" />
            <span>Copy to Clipboard</span>
          {/if}
        </Button>

        <div class="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onclick={() => {
              open = false;
              onclose?.();
            }}
            class="text-xs text-slate-500 dark:text-slate-400"
          >
            Cancel
          </Button>
          <Button variant="primary" size="sm" onclick={handleMarkSent} class="gap-1.5 text-xs">
            <Send class="w-3.5 h-3.5" />
            <span>Record Log & Mark Sent</span>
          </Button>
        </div>
      </div>
    </div>
  {/if}
</Dialog>
