<script lang="ts">
  import { authStore } from '../../stores/auth-store.svelte';
  import { themeStore } from '../../stores/theme.svelte';
  import Button from '../atoms/Button.svelte';
  import Badge from '../atoms/Badge.svelte';
  import {
    Sparkles,
    Lock,
    User,
    Eye,
    EyeOff,
    ShieldCheck,
    PhoneCall,
    DollarSign,
    ArrowRight,
    AlertCircle,
    Server,
    Sun,
    Moon,
    Flame,
    CheckCircle2
  } from 'lucide-svelte';

  let username = $state('');
  let password = $state('');
  let remember = $state(true);
  let showPassword = $state(false);
  let isSubmitting = $state(false);
  let localError = $state<string | null>(null);

  async function handleLogin(e: SubmitEvent) {
    e.preventDefault();
    if (!username.trim()) {
      localError = 'Please enter your username or work email.';
      return;
    }
    if (!password.trim()) {
      localError = 'Please enter your password.';
      return;
    }

    localError = null;
    isSubmitting = true;

    try {
      const success = await authStore.login(username.trim(), password.trim(), remember);
      if (!success) {
        localError = authStore.errorMessage || 'Invalid credentials. Please verify your login details.';
      }
    } catch (err: any) {
      localError = 'An unexpected login error occurred. Please try again.';
    } finally {
      isSubmitting = false;
    }
  }

  function fillDemoCredentials(role: 'rep' | 'admin') {
    if (role === 'rep') {
      username = 'sales_rep';
      password = 'password123';
    } else {
      username = 'admin';
      password = 'password123';
    }
    localError = null;
  }
</script>

<div class="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--fm-bg)] text-[var(--fm-text)] relative overflow-hidden select-none transition-colors duration-300">
  <!-- Dynamic Ambient Background Glows -->
  <div class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

  <!-- Top Right Theme Toggle -->
  <div class="absolute top-5 right-5 z-20">
    <button
      type="button"
      onclick={() => themeStore.toggleTheme()}
      class="p-2.5 rounded-xl bg-[var(--fm-surface)] border border-[var(--fm-border)] text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] shadow-xs transition-all cursor-pointer"
      title="Toggle Theme"
    >
      {#if themeStore.currentTheme === 'dark'}
        <Sun class="w-4 h-4 text-amber-400" />
      {:else}
        <Moon class="w-4 h-4 text-indigo-600" />
      {/if}
    </button>
  </div>

  <!-- Main Glassmorphic Login Card -->
  <div class="w-full max-w-md relative z-10 space-y-6">
    <!-- Brand Header -->
    <div class="text-center space-y-2">
      <div class="inline-flex items-center justify-center p-3.5 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 mb-2">
        <Sparkles class="w-7 h-7 text-emerald-500 animate-pulse" />
      </div>
      <h1 class="text-2xl font-black tracking-tight text-[var(--fm-text)] font-sans">
        Fresh Mints <span class="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent">Enterprise</span>
      </h1>
      <p class="text-xs text-[var(--fm-text-muted)] max-w-xs mx-auto">
        B2B Practice Intelligence, Telemarketing Dialing &amp; Sovereign 2-Year Turnkey Sales Portal
      </p>
    </div>

    <!-- Login Form Card -->
    <div class="p-7 rounded-3xl bg-[var(--fm-surface)]/90 backdrop-blur-2xl border border-[var(--fm-border)] shadow-2xl shadow-black/10 dark:shadow-black/60 space-y-5">
      <!-- Rep Security Badge -->
      <div class="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
        <div class="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-semibold">
          <ShieldCheck class="w-4 h-4 text-emerald-500" />
          <span>Authorized Sales Rep &amp; Admin Access</span>
        </div>
        <Badge variant="success" class="text-[10px] font-mono">$300 Bounty</Badge>
      </div>

      <!-- Error Alert -->
      {#if localError || authStore.errorMessage}
        <div class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span class="leading-relaxed">{localError || authStore.errorMessage}</span>
        </div>
      {/if}

      <!-- Form Inputs -->
      <form onsubmit={handleLogin} class="space-y-4">
        <!-- Username / Email Field -->
        <div class="space-y-1.5">
          <label for="fm-username" class="block text-xs font-bold text-[var(--fm-text)] uppercase tracking-wider">
            Username or Work Email
          </label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--fm-text-muted)]">
              <User class="w-4 h-4" />
            </div>
            <input
              id="fm-username"
              type="text"
              bind:value={username}
              placeholder="e.g. rep@mycompass.local or admin"
              autocomplete="username"
              required
              class="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] placeholder-[var(--fm-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        <!-- Password Field -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <label for="fm-password" class="block text-xs font-bold text-[var(--fm-text)] uppercase tracking-wider">
              Password
            </label>
          </div>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--fm-text-muted)]">
              <Lock class="w-4 h-4" />
            </div>
            <input
              id="fm-password"
              type={showPassword ? 'text' : 'password'}
              bind:value={password}
              placeholder="Enter your security password"
              autocomplete="current-password"
              required
              class="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] placeholder-[var(--fm-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
            />
            <button
              type="button"
              onclick={() => (showPassword = !showPassword)}
              class="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] cursor-pointer"
            >
              {#if showPassword}
                <EyeOff class="w-4 h-4" />
              {:else}
                <Eye class="w-4 h-4" />
              {/if}
            </button>
          </div>
        </div>

        <!-- Remember Me Checkbox -->
        <div class="flex items-center justify-between pt-1">
          <label class="flex items-center gap-2 text-xs text-[var(--fm-text-muted)] cursor-pointer select-none">
            <input
              type="checkbox"
              bind:checked={remember}
              class="w-3.5 h-3.5 rounded bg-[var(--fm-surface-sunken)] border-[var(--fm-border)] text-emerald-600 focus:ring-emerald-500/30 accent-emerald-600"
            />
            <span>Remember session on this device</span>
          </label>
        </div>

        <!-- Submit Button -->
        <Button
          type="submit"
          variant="primary"
          size="md"
          class="w-full justify-center gap-2 text-xs font-bold py-3 mt-2 shadow-lg shadow-emerald-500/20"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <span class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            <span>Authenticating...</span>
          {:else}
            <PhoneCall class="w-3.5 h-3.5" />
            <span>Launch Fresh Mints Rep Hub</span>
            <ArrowRight class="w-3.5 h-3.5" />
          {/if}
        </Button>
      </form>

      <!-- Quick Demo Account Fillers -->
      <div class="pt-4 border-t border-[var(--fm-border-subtle)] space-y-2">
        <div class="text-[11px] font-semibold text-[var(--fm-text-muted)] text-center">
          Quick Access Credential Presets:
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            type="button"
            onclick={() => fillDemoCredentials('rep')}
            class="p-2 rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border-subtle)] hover:border-emerald-500/40 text-[11px] font-medium text-[var(--fm-text)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <PhoneCall class="w-3 h-3 text-emerald-500" />
            <span>Sales Rep Preset</span>
          </button>

          <button
            type="button"
            onclick={() => fillDemoCredentials('admin')}
            class="p-2 rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border-subtle)] hover:border-purple-500/40 text-[11px] font-medium text-[var(--fm-text)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <Server class="w-3 h-3 text-purple-500" />
            <span>Admin Preset</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Security Guarantee Footer -->
    <div class="flex items-center justify-center gap-2 text-[11px] text-[var(--fm-text-muted)]">
      <Lock class="w-3 h-3 text-emerald-500" />
      <span>256-Bit Encrypted Session • WordPress Sovereign Auth</span>
    </div>
  </div>
</div>
