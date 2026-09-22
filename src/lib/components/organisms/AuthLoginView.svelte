<script lang="ts">
  import { authStore, type SaasPlanTier } from "../../stores/auth-store.svelte";
  import { themeStore } from "../../stores/theme.svelte";
  import Button from "../atoms/Button.svelte";
  import Badge from "../atoms/Badge.svelte";
  import {
    Sparkles,
    Lock,
    User,
    Mail,
    Eye,
    EyeOff,
    ShieldCheck,
    PhoneCall,
    ArrowRight,
    AlertCircle,
    Sun,
    Moon,
    Flame,
    Zap,
    Radio
  } from "lucide-svelte";

  let isSignupMode = $state(false);
  let username = $state("");
  let email = $state("");
  let password = $state("");
  let selectedPlan = $state<SaasPlanTier>("starter");
  let remember = $state(true);
  let showPassword = $state(false);
  let isSubmitting = $state(false);
  let localError = $state<string | null>(null);

  async function handleSubmit(e: SubmitEvent) {
    e.preventDefault();
    localError = null;

    const trimmedUsername = username.trim();
    const hasUsername = trimmedUsername.length >= 3;
    const hasPassword = password.length >= 6;

    if (!hasUsername) {
      localError = "Please enter a valid username (min 3 characters).";
      return;
    }
    if (!hasPassword) {
      localError = "Please enter a password with at least 6 characters.";
      return;
    }

    if (isSignupMode) {
      const trimmedEmail = email.trim();
      const hasValidEmail = trimmedEmail.includes("@") && trimmedEmail.includes(".");
      if (!hasValidEmail) {
        localError = "Please enter a valid corporate or professional email.";
        return;
      }
    }

    isSubmitting = true;

    try {
      if (isSignupMode) {
        const success = await authStore.signup(trimmedUsername, email.trim(), password, selectedPlan);
        const hasFailed = !success;
        if (hasFailed) {
          localError = authStore.errorMessage || "Account registration failed. Please try again.";
        }
      } else {
        const success = await authStore.login(trimmedUsername, password, remember);
        const hasFailed = !success;
        if (hasFailed) {
          localError = authStore.errorMessage || "Invalid credentials. Please verify your username and password.";
        }
      }
    } catch {
      localError = "An unexpected authentication error occurred. Please try again.";
    } finally {
      isSubmitting = false;
    }
  }

  async function handleDemoLogin() {
    isSubmitting = true;
    localError = null;
    try {
      await authStore.signup("Demo Hunter", "hunter@freshmints.io", "demopass123", "pro");
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div
  class="min-h-screen w-full flex items-center justify-center p-4 bg-[var(--fm-bg)] text-[var(--fm-text)] relative overflow-hidden select-none transition-colors duration-300"
>
  <div
    class="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/15 dark:bg-emerald-500/20 rounded-full blur-3xl pointer-events-none"
  ></div>
  <div
    class="absolute -bottom-40 -right-40 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/20 rounded-full blur-3xl pointer-events-none"
  ></div>
  <div
    class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
  ></div>

  <div class="absolute top-5 right-5 z-20">
    <button
      type="button"
      onclick={() => themeStore.toggleTheme()}
      class="p-2.5 rounded-xl bg-[var(--fm-surface)] border border-[var(--fm-border)] text-[var(--fm-text-muted)] hover:text-[var(--fm-text)] shadow-xs transition-all cursor-pointer"
      title="Toggle Theme"
    >
      {#if themeStore.currentTheme === "dark"}
        <Sun class="w-4 h-4 text-amber-400" />
      {:else}
        <Moon class="w-4 h-4 text-indigo-600" />
      {/if}
    </button>
  </div>

  <div class="w-full max-w-md relative z-10 space-y-5">
    <div class="text-center space-y-2">
      <div
        class="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 mb-1"
      >
        <Sparkles class="w-6 h-6 text-emerald-500 animate-pulse" />
      </div>
      <h1 class="text-2xl font-black tracking-tight text-[var(--fm-text)] font-sans">
        Fresh Mints <span
          class="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent"
          >SaaS Platform</span
        >
      </h1>
      <p class="text-xs text-[var(--fm-text-muted)] max-w-xs mx-auto">
        B2B Lead Intelligence, Automated Social Intent Radar &amp; Turnkey Pitch Pipeline
      </p>
    </div>

    <div
      class="p-6 rounded-3xl bg-[var(--fm-surface)]/90 backdrop-blur-2xl border border-[var(--fm-border)] shadow-2xl shadow-black/10 dark:shadow-black/60 space-y-4"
    >
      <div class="grid grid-cols-2 p-1 rounded-2xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-xs font-bold">
        <button
          type="button"
          onclick={() => { isSignupMode = false; localError = null; }}
          class={`py-2 rounded-xl transition-all cursor-pointer ${!isSignupMode ? 'bg-[var(--fm-surface)] text-[var(--fm-text)] shadow-xs' : 'text-[var(--fm-text-muted)] hover:text-[var(--fm-text)]'}`}
        >
          Sign In
        </button>
        <button
          type="button"
          onclick={() => { isSignupMode = true; localError = null; }}
          class={`py-2 rounded-xl transition-all cursor-pointer ${isSignupMode ? 'bg-[var(--fm-surface)] text-[var(--fm-text)] shadow-xs' : 'text-[var(--fm-text-muted)] hover:text-[var(--fm-text)]'}`}
        >
          Create Account
        </button>
      </div>

      {#if localError || authStore.errorMessage}
        <div
          class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
        >
          <AlertCircle class="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
          <span class="leading-relaxed">{localError || authStore.errorMessage}</span>
        </div>
      {/if}

      <form
        onsubmit={handleSubmit}
        class="space-y-3.5"
      >
        <div class="space-y-1">
          <label
            for="fm-username"
            class="block text-[11px] font-bold text-[var(--fm-text)] uppercase tracking-wider"
          >
            {isSignupMode ? "Account Username" : "Username or Work Email"}
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--fm-text-muted)]"
            >
              <User class="w-4 h-4" />
            </div>
            <input
              id="fm-username"
              type="text"
              bind:value={username}
              placeholder={isSignupMode ? "e.g. alex_growth" : "e.g. rep@mycompass.local or admin"}
              autocomplete="username"
              required
              class="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] placeholder-[var(--fm-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
            />
          </div>
        </div>

        {#if isSignupMode}
          <div class="space-y-1">
            <label
              for="fm-email"
              class="block text-[11px] font-bold text-[var(--fm-text)] uppercase tracking-wider"
            >
              Work Email Address
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--fm-text-muted)]"
              >
                <Mail class="w-4 h-4" />
              </div>
              <input
                id="fm-email"
                type="email"
                bind:value={email}
                placeholder="name@company.com"
                autocomplete="email"
                required
                class="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] placeholder-[var(--fm-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div class="space-y-1.5">
            <label class="block text-[11px] font-bold text-[var(--fm-text)] uppercase tracking-wider">
              Subscription Plan
            </label>
            <div class="grid grid-cols-3 gap-2">
              <button
                type="button"
                onclick={() => (selectedPlan = 'free')}
                class={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${selectedPlan === 'free' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--fm-border)] bg-[var(--fm-surface-sunken)] opacity-70'}`}
              >
                <div class="text-[11px] font-bold text-[var(--fm-text)]">Free</div>
                <div class="text-[10px] text-[var(--fm-text-muted)]">2 Rules • 10 Scans</div>
              </button>
              <button
                type="button"
                onclick={() => (selectedPlan = 'starter')}
                class={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${selectedPlan === 'starter' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--fm-border)] bg-[var(--fm-surface-sunken)] opacity-70'}`}
              >
                <div class="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Starter</div>
                <div class="text-[10px] text-[var(--fm-text-muted)]">5 Rules • 50 Scans</div>
              </button>
              <button
                type="button"
                onclick={() => (selectedPlan = 'pro')}
                class={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${selectedPlan === 'pro' ? 'border-emerald-500 bg-emerald-500/10' : 'border-[var(--fm-border)] bg-[var(--fm-surface-sunken)] opacity-70'}`}
              >
                <div class="text-[11px] font-bold text-cyan-600 dark:text-cyan-400">Pro</div>
                <div class="text-[10px] text-[var(--fm-text-muted)]">20 Rules • 500 Scans</div>
              </button>
            </div>
          </div>
        {/if}

        <div class="space-y-1">
          <label
            for="fm-password"
            class="block text-[11px] font-bold text-[var(--fm-text)] uppercase tracking-wider"
          >
            Password
          </label>
          <div class="relative">
            <div
              class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[var(--fm-text-muted)]"
            >
              <Lock class="w-4 h-4" />
            </div>
            <input
              id="fm-password"
              type={showPassword ? "text" : "password"}
              bind:value={password}
              placeholder="Enter your password"
              autocomplete={isSignupMode ? "new-password" : "current-password"}
              required
              class="w-full pl-10 pr-10 py-2 text-xs rounded-xl bg-[var(--fm-surface-sunken)] border border-[var(--fm-border)] text-[var(--fm-text)] placeholder-[var(--fm-text-muted)]/60 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all font-medium"
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

        <Button
          type="submit"
          variant="primary"
          size="md"
          class="w-full justify-center gap-2 text-xs font-bold py-2.5 mt-2 shadow-lg shadow-emerald-500/20"
          disabled={isSubmitting}
        >
          {#if isSubmitting}
            <span
              class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"
            ></span>
            <span>Processing...</span>
          {:else if isSignupMode}
            <Sparkles class="w-3.5 h-3.5" />
            <span>Create SaaS Account</span>
            <ArrowRight class="w-3.5 h-3.5" />
          {:else}
            <Radio class="w-3.5 h-3.5" />
            <span>Sign In to SaaS Deck</span>
            <ArrowRight class="w-3.5 h-3.5" />
          {/if}
        </Button>
      </form>

      <div class="pt-2 border-t border-[var(--fm-border)]">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          class="w-full justify-center gap-2 text-[11px] font-semibold text-[var(--fm-text-muted)] hover:text-[var(--fm-text)]"
          onclick={handleDemoLogin}
          disabled={isSubmitting}
        >
          <Zap class="w-3 h-3 text-amber-500" />
          <span>Launch Instant Demo Sandbox (Pro Tier)</span>
        </Button>
      </div>
    </div>

    <div class="flex items-center justify-center gap-2 text-[11px] text-[var(--fm-text-muted)]">
      <Lock class="w-3 h-3 text-emerald-500" />
      <span>256-Bit Encrypted Session • Fresh Mints Cloud</span>
    </div>
  </div>
</div>
